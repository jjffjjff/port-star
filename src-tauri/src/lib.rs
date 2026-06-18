use base64::{engine::general_purpose::STANDARD as B64, Engine};
use image::{ImageBuffer, Rgba};
use netstat2::{AddressFamilyFlags, ProtocolFlags, ProtocolSocketInfo};
use serde::Serialize;
use std::collections::{HashMap, HashSet};
use std::sync::Mutex;
use sysinfo::{ProcessRefreshKind, RefreshKind, System, UpdateKind};
use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, State, WindowEvent,
};

#[cfg(target_os = "windows")]
use windows::{
    core::PCWSTR,
    Win32::{
        Foundation::{CloseHandle, LUID},
        Graphics::Gdi::{
            CreateCompatibleDC, DeleteDC, DeleteObject, GetDIBits, GetObjectW, BITMAP, BITMAPINFO,
            BITMAPINFOHEADER, DIB_RGB_COLORS,
        },
        Security::{
            AdjustTokenPrivileges, GetTokenInformation, LookupPrivilegeValueW, LUID_AND_ATTRIBUTES,
            SE_PRIVILEGE_ENABLED, TOKEN_ADJUST_PRIVILEGES, TOKEN_ELEVATION, TOKEN_PRIVILEGES,
            TOKEN_QUERY, TokenElevation,
        },
        System::Threading::{
            GetCurrentProcess, OpenProcess, OpenProcessToken, TerminateProcess, PROCESS_TERMINATE,
        },
        UI::{
            Shell::ExtractIconExW,
            WindowsAndMessaging::{DestroyIcon, GetIconInfo, HICON, ICONINFO},
        },
    },
};

#[derive(Serialize, Clone)]
pub struct PortEntry {
    pub pid: u32,
    pub port: u16,
    pub process_name: String,
    pub exe_path: Option<String>,
    pub icon_b64: Option<String>,
    pub needs_elevation: bool,
}

#[derive(PartialEq)]
enum WindowMode {
    Menu,
    Popped,
}

struct AppState {
    mode: Mutex<WindowMode>,
    icon_cache: Mutex<HashMap<String, Option<String>>>,
}

#[cfg(target_os = "windows")]
fn extract_icon_b64(exe_path: &str) -> Option<String> {
    unsafe {
        let wide: Vec<u16> = exe_path.encode_utf16().chain(std::iter::once(0)).collect();
        let mut large: HICON = HICON::default();
        let count = ExtractIconExW(PCWSTR(wide.as_ptr()), 0, Some(&mut large), None, 1);
        if count == 0 || large.is_invalid() {
            return None;
        }

        let result = hicon_to_png_b64(large);
        let _ = DestroyIcon(large);
        result
    }
}

#[cfg(target_os = "windows")]
unsafe fn hicon_to_png_b64(hicon: HICON) -> Option<String> {
    let mut info = ICONINFO::default();
    if GetIconInfo(hicon, &mut info).is_err() {
        return None;
    }

    let mut bm = BITMAP::default();
    GetObjectW(
        info.hbmColor,
        std::mem::size_of::<BITMAP>() as i32,
        Some(&mut bm as *mut BITMAP as *mut _),
    );

    let w = bm.bmWidth as u32;
    let h = bm.bmHeight as u32;
    if w == 0 || h == 0 {
        let _ = DeleteObject(info.hbmColor);
        let _ = DeleteObject(info.hbmMask);
        return None;
    }

    let mut bmi = BITMAPINFO {
        bmiHeader: BITMAPINFOHEADER {
            biSize: std::mem::size_of::<BITMAPINFOHEADER>() as u32,
            biWidth: w as i32,
            biHeight: -(h as i32), // top-down
            biPlanes: 1,
            biBitCount: 32,
            biCompression: 0,
            biSizeImage: 0,
            biXPelsPerMeter: 0,
            biYPelsPerMeter: 0,
            biClrUsed: 0,
            biClrImportant: 0,
        },
        ..Default::default()
    };

    let buf_size = (w * h * 4) as usize;
    let mut pixels = vec![0u8; buf_size];

    // Need a compatible DC for GetDIBits
    let hdc = CreateCompatibleDC(None);
    let rows = GetDIBits(
        hdc,
        info.hbmColor,
        0,
        h,
        Some(pixels.as_mut_ptr() as *mut _),
        &mut bmi,
        DIB_RGB_COLORS,
    );
    let _ = DeleteDC(hdc);
    let _ = DeleteObject(info.hbmColor);
    let _ = DeleteObject(info.hbmMask);

    if rows == 0 {
        return None;
    }

    // Windows returns BGRA — convert to RGBA
    for chunk in pixels.chunks_exact_mut(4) {
        chunk.swap(0, 2);
    }

    let img: ImageBuffer<Rgba<u8>, Vec<u8>> = ImageBuffer::from_raw(w, h, pixels)?;
    let mut png_bytes: Vec<u8> = Vec::new();
    img.write_to(
        &mut std::io::Cursor::new(&mut png_bytes),
        image::ImageFormat::Png,
    )
    .ok()?;

    Some(B64.encode(&png_bytes))
}

#[cfg(not(target_os = "windows"))]
fn extract_icon_b64(_exe_path: &str) -> Option<String> {
    None
}

#[cfg(target_os = "windows")]
fn process_needs_elevation(pid: u32) -> bool {
    unsafe {
        match OpenProcess(PROCESS_TERMINATE, false, pid) {
            Ok(handle) => {
                let _ = CloseHandle(handle);
                false
            }
            Err(e) => e.code().0 == 0x80070005u32 as i32, // ERROR_ACCESS_DENIED
        }
    }
}

#[cfg(not(target_os = "windows"))]
fn process_needs_elevation(_pid: u32) -> bool {
    false
}

fn get_or_cache_icon(cache: &mut HashMap<String, Option<String>>, path: &str) -> Option<String> {
    if let Some(cached) = cache.get(path) {
        return cached.clone();
    }
    let icon = extract_icon_b64(path);
    cache.insert(path.to_string(), icon.clone());
    icon
}

#[tauri::command]
fn list_ports(state: State<AppState>) -> Vec<PortEntry> {
    let sockets = match netstat2::get_sockets_info(
        AddressFamilyFlags::IPV4 | AddressFamilyFlags::IPV6,
        ProtocolFlags::TCP,
    ) {
        Ok(s) => s,
        Err(_) => return vec![],
    };

    let mut pairs: HashSet<(u32, u16)> = HashSet::new();
    for si in &sockets {
        if let ProtocolSocketInfo::Tcp(tcp) = &si.protocol_socket_info {
            if tcp.state != netstat2::TcpState::Listen {
                continue;
            }
            let addr = tcp.local_addr.to_string();
            if !matches!(addr.as_str(), "0.0.0.0" | "127.0.0.1" | "::" | "::1") {
                continue;
            }
            for &pid in &si.associated_pids {
                pairs.insert((pid, tcp.local_port));
            }
        }
    }

    let sys = System::new_with_specifics(
        RefreshKind::new().with_processes(ProcessRefreshKind::new().with_exe(UpdateKind::Always)),
    );

    let mut cache = state.icon_cache.lock().unwrap();
    let mut entries: Vec<PortEntry> = pairs
        .into_iter()
        .map(|(pid, port)| {
            let proc = sys.process(sysinfo::Pid::from_u32(pid));
            let process_name = proc
                .map(|p| p.name().to_string_lossy().into_owned())
                .unwrap_or_else(|| format!("pid:{pid}"));
            let exe_path = proc
                .and_then(|p| p.exe())
                .map(|p| p.to_string_lossy().into_owned());

            let icon_b64 = exe_path
                .as_deref()
                .and_then(|p| get_or_cache_icon(&mut cache, p));

            let needs_elevation = process_needs_elevation(pid);
            PortEntry {
                pid,
                port,
                process_name,
                exe_path,
                icon_b64,
                needs_elevation,
            }
        })
        .collect();

    entries.sort_by_key(|e| e.port);
    entries
}

#[cfg(target_os = "windows")]
fn enable_debug_privilege() {
    unsafe {
        let mut token = windows::Win32::Foundation::HANDLE::default();
        if OpenProcessToken(
            GetCurrentProcess(),
            TOKEN_ADJUST_PRIVILEGES | TOKEN_QUERY,
            &mut token,
        )
        .is_err()
        {
            return;
        }
        let name: Vec<u16> = "SeDebugPrivilege\0".encode_utf16().collect();
        let mut luid = LUID::default();
        if LookupPrivilegeValueW(PCWSTR::null(), PCWSTR(name.as_ptr()), &mut luid).is_err() {
            let _ = CloseHandle(token);
            return;
        }
        let tp = TOKEN_PRIVILEGES {
            PrivilegeCount: 1,
            Privileges: [LUID_AND_ATTRIBUTES {
                Luid: luid,
                Attributes: SE_PRIVILEGE_ENABLED,
            }],
        };
        let _ = AdjustTokenPrivileges(token, false, Some(&tp), 0, None, None);
        let _ = CloseHandle(token);
    }
}

/// Walks up through known dev-tool launchers to find the process to kill.
/// Only steps to a parent if it is a recognized launcher (npm, nodemon, cargo…).
/// Stops at any unknown process, preventing accidental escalation into system processes.
fn kill_root_pid(sys: &System, start: u32) -> u32 {
    const LAUNCHERS: &[&str] = &[
        "npm", "npx", "pnpm", "yarn", "bun",
        "node", "nodemon", "ts-node", "tsx", "deno",
        "python", "python3", "uvicorn", "gunicorn", "flask",
        "ruby", "bundle",
        "cargo", "dotnet", "java",
    ];

    let mut current = sysinfo::Pid::from_u32(start);
    loop {
        let Some(proc) = sys.process(current) else { break };
        let Some(parent_pid) = proc.parent() else { break };
        if parent_pid.as_u32() <= 4 { break }
        let Some(parent) = sys.process(parent_pid) else { break };
        let raw = parent.name().to_string_lossy().to_lowercase();
        let name = raw.trim_end_matches(".exe");
        if !LAUNCHERS.iter().any(|l| name.contains(l)) { break }
        current = parent_pid;
    }
    current.as_u32()
}

#[cfg(target_os = "windows")]
fn is_app_elevated() -> bool {
    unsafe {
        let mut token = windows::Win32::Foundation::HANDLE::default();
        if OpenProcessToken(GetCurrentProcess(), TOKEN_QUERY, &mut token).is_err() {
            return false;
        }
        let mut elevation = TOKEN_ELEVATION::default();
        let mut ret: u32 = 0;
        let ok = GetTokenInformation(
            token,
            TokenElevation,
            Some(&mut elevation as *mut TOKEN_ELEVATION as *mut _),
            std::mem::size_of::<TOKEN_ELEVATION>() as u32,
            &mut ret,
        )
        .is_ok();
        let _ = CloseHandle(token);
        ok && elevation.TokenIsElevated != 0
    }
}

#[tauri::command]
fn is_elevated() -> bool {
    #[cfg(target_os = "windows")]
    return is_app_elevated();
    #[cfg(not(target_os = "windows"))]
    return false;
}

#[tauri::command]
fn get_autostart_elevated() -> bool {
    std::process::Command::new("schtasks")
        .args(["/query", "/tn", "PortStar"])
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

#[tauri::command]
fn set_autostart_elevated(enabled: bool) -> Result<(), String> {
    let out = if enabled {
        let exe = std::env::current_exe().map_err(|e| e.to_string())?;
        let tr = format!("\"{}\"", exe.to_string_lossy());
        std::process::Command::new("schtasks")
            .args(["/create", "/tn", "PortStar", "/tr", &tr, "/sc", "onlogon", "/rl", "highest", "/f"])
            .output()
            .map_err(|e| e.to_string())?
    } else {
        std::process::Command::new("schtasks")
            .args(["/delete", "/tn", "PortStar", "/f"])
            .output()
            .map_err(|e| e.to_string())?
    };

    if out.status.success() {
        return Ok(());
    }
    let stderr = String::from_utf8_lossy(&out.stderr).trim().to_string();
    let stdout = String::from_utf8_lossy(&out.stdout).trim().to_string();
    Err(if !stderr.is_empty() { stderr } else { stdout })
}

#[tauri::command]
fn kill_process(pid: u32) -> Result<(), String> {
    let sys = System::new_with_specifics(
        RefreshKind::new().with_processes(ProcessRefreshKind::new()),
    );

    // Walk up the process tree to kill the launcher (npm/nodemon) instead of just
    // the worker, preventing the parent from immediately restarting it.
    let root = kill_root_pid(&sys, pid);

    if sys
        .process(sysinfo::Pid::from_u32(root))
        .map(|p| p.kill())
        .unwrap_or(false)
    {
        return Ok(());
    }

    #[cfg(target_os = "windows")]
    unsafe {
        match OpenProcess(PROCESS_TERMINATE, false, root) {
            Ok(handle) => {
                let result = TerminateProcess(handle, 1);
                let _ = CloseHandle(handle);
                return result.map_err(|e| {
                    if e.code().0 == 0x80070005u32 as i32 {
                        "Process is protected and cannot be killed".to_string()
                    } else {
                        format!("Terminate failed: {e}")
                    }
                });
            }
            Err(e) => {
                if e.code().0 == 0x80070005u32 as i32 {
                    return Err("needs_elevation".to_string());
                }
                return Err(format!("Cannot open process ({})", e));
            }
        }
    }

    #[cfg(not(target_os = "windows"))]
    Err(format!("Failed to kill process {pid}"))
}

#[tauri::command]
fn relaunch_as_admin(app: AppHandle) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        use windows::Win32::Foundation::ERROR_CANCELLED;
        use windows::Win32::UI::Shell::{SHELLEXECUTEINFOW, ShellExecuteExW};
        use windows::Win32::UI::WindowsAndMessaging::SW_SHOW;

        let exe = std::env::current_exe().map_err(|e| e.to_string())?;
        let exe_wide: Vec<u16> = exe
            .to_string_lossy()
            .encode_utf16()
            .chain(Some(0))
            .collect();
        let verb: Vec<u16> = "runas\0".encode_utf16().collect();

        let mut info: SHELLEXECUTEINFOW = unsafe { std::mem::zeroed() };
        info.cbSize = std::mem::size_of::<SHELLEXECUTEINFOW>() as u32;
        info.lpVerb = PCWSTR(verb.as_ptr());
        info.lpFile = PCWSTR(exe_wide.as_ptr());
        info.nShow = SW_SHOW.0 as i32;

        unsafe {
            if ShellExecuteExW(&mut info).is_err() {
                let err = windows::Win32::Foundation::GetLastError();
                if err == ERROR_CANCELLED {
                    return Err("elevation_cancelled".to_string());
                }
                return Err(format!("Relaunch failed (error {})", err.0));
            }
        }

        app.exit(0);
        Ok(())
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = app;
        Err("Not supported on this platform".to_string())
    }
}

#[tauri::command]
fn open_url(app: AppHandle, url: String) -> Result<(), String> {
    use tauri_plugin_opener::OpenerExt;
    app.opener()
        .open_url(url, None::<&str>)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_autostart(app: AppHandle) -> Result<bool, String> {
    use tauri_plugin_autostart::ManagerExt;
    app.autolaunch().is_enabled().map_err(|e| e.to_string())
}

#[tauri::command]
fn set_autostart(app: AppHandle, enabled: bool) -> Result<(), String> {
    use tauri_plugin_autostart::ManagerExt;
    let al = app.autolaunch();
    if enabled {
        al.enable().map_err(|e| e.to_string())
    } else {
        al.disable().map_err(|e| e.to_string())
    }
}

#[tauri::command]
fn pop_out(app: AppHandle, state: State<AppState>) -> Result<(), String> {
    *state.mode.lock().unwrap() = WindowMode::Popped;
    let win = app.get_webview_window("main").ok_or("no main window")?;
    win.set_decorations(true).map_err(|e| e.to_string())?;
    win.set_resizable(true).map_err(|e| e.to_string())?;
    win.set_skip_taskbar(false).map_err(|e| e.to_string())?;
    win.set_always_on_top(false).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn dock_back(app: AppHandle, state: State<AppState>) -> Result<(), String> {
    *state.mode.lock().unwrap() = WindowMode::Menu;
    let win = app.get_webview_window("main").ok_or("no main window")?;
    win.set_decorations(false).map_err(|e| e.to_string())?;
    win.set_resizable(false).map_err(|e| e.to_string())?;
    win.set_skip_taskbar(true).map_err(|e| e.to_string())?;
    win.set_always_on_top(false).map_err(|e| e.to_string())?;
    win.hide().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn set_always_on_top(app: AppHandle, enabled: bool) -> Result<(), String> {
    let win = app.get_webview_window("main").ok_or("no main window")?;
    win.set_always_on_top(enabled).map_err(|e| e.to_string())
}

#[tauri::command]
fn quit_app(app: AppHandle) {
    app.exit(0);
}

#[tauri::command]
fn get_window_mode(state: State<AppState>) -> String {
    match *state.mode.lock().unwrap() {
        WindowMode::Menu => "menu".to_string(),
        WindowMode::Popped => "popped".to_string(),
    }
}

#[cfg(target_os = "windows")]
fn work_area() -> (i32, i32, i32, i32) {
    use windows::Win32::Foundation::RECT;
    use windows::Win32::UI::WindowsAndMessaging::{
        SystemParametersInfoW, SPI_GETWORKAREA, SYSTEM_PARAMETERS_INFO_UPDATE_FLAGS,
    };
    let mut rect = RECT::default();
    unsafe {
        let _ = SystemParametersInfoW(
            SPI_GETWORKAREA,
            0,
            Some(&mut rect as *mut RECT as *mut _),
            SYSTEM_PARAMETERS_INFO_UPDATE_FLAGS(0),
        );
    }
    (rect.left, rect.top, rect.right, rect.bottom)
}

#[cfg(not(target_os = "windows"))]
fn work_area() -> (i32, i32, i32, i32) {
    (0, 0, 1920, 1080)
}

fn show_menu_window(app: &AppHandle, position: tauri::PhysicalPosition<f64>) {
    let Some(win) = app.get_webview_window("main") else {
        return;
    };

    let size = win.outer_size().unwrap_or(tauri::PhysicalSize {
        width: 380,
        height: 520,
    });

    let (wa_left, wa_top, wa_right, wa_bottom) = work_area();
    let w = size.width as i32;
    let h = size.height as i32;

    let x = (position.x as i32 - w).clamp(wa_left, wa_right - w);
    let y = (position.y as i32 - h).clamp(wa_top, wa_bottom - h);

    let _ = win.set_position(tauri::PhysicalPosition::new(x, y));
    let _ = win.show();
    let _ = win.set_focus();
}

const TRAY_SVG: &str = r##"<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="white" d="M12 2.25a2.75 2.75 0 0 0-.75 5.396v12.57a8.25 8.25 0 0 1-7.466-7.466H5a.75.75 0 0 0 0-1.5H3a.75.75 0 0 0-.75.75c0 5.385 4.365 9.75 9.75 9.75s9.75-4.365 9.75-9.75a.75.75 0 0 0-.75-.75h-2a.75.75 0 0 0 0 1.5h1.216a8.25 8.25 0 0 1-7.466 7.466V7.646A2.751 2.751 0 0 0 12 2.25"/></svg>"##;

const WINDOW_SVG: &str = r##"<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#7c6af7" d="M12 2.25a2.75 2.75 0 0 0-.75 5.396v12.57a8.25 8.25 0 0 1-7.466-7.466H5a.75.75 0 0 0 0-1.5H3a.75.75 0 0 0-.75.75c0 5.385 4.365 9.75 9.75 9.75s9.75-4.365 9.75-9.75a.75.75 0 0 0-.75-.75h-2a.75.75 0 0 0 0 1.5h1.216a8.25 8.25 0 0 1-7.466 7.466V7.646A2.751 2.751 0 0 0 12 2.25"/></svg>"##;

fn rasterize_svg(svg: &str, size: u32) -> tauri::image::Image<'static> {
    let opt = resvg::usvg::Options::default();
    let tree = resvg::usvg::Tree::from_str(svg, &opt).expect("invalid svg");
    let mut pixmap = resvg::tiny_skia::Pixmap::new(size, size).expect("pixmap alloc");
    let transform = resvg::tiny_skia::Transform::from_scale(
        size as f32 / tree.size().width(),
        size as f32 / tree.size().height(),
    );
    resvg::render(&tree, transform, &mut pixmap.as_mut());
    tauri::image::Image::new_owned(pixmap.data().to_vec(), size, size)
}

fn build_tray_icon() -> tauri::image::Image<'static> {
    rasterize_svg(TRAY_SVG, 32)
}

fn build_window_icon() -> tauri::image::Image<'static> {
    rasterize_svg(WINDOW_SVG, 64)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(target_os = "windows")]
    enable_debug_privilege();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .manage(AppState {
            mode: Mutex::new(WindowMode::Menu),
            icon_cache: Mutex::new(HashMap::new()),
        })
        .setup(|app| {
            if let Some(win) = app.get_webview_window("main") {
                let _ = win.set_icon(build_window_icon());
            }

            let quit = MenuItemBuilder::with_id("quit", "Quit").build(app)?;
            let menu = MenuBuilder::new(app).items(&[&quit]).build()?;

            let _tray = TrayIconBuilder::new()
                .icon(build_tray_icon())
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left | MouseButton::Right,
                        button_state: MouseButtonState::Up,
                        position,
                        ..
                    } = event
                    {
                        show_menu_window(tray.app_handle(), position);
                    }
                })
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "quit" => app.exit(0),
                    _ => {}
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
            let app = window.app_handle();
            match event {
                WindowEvent::Focused(false) => {
                    if let Some(state) = app.try_state::<AppState>() {
                        if matches!(*state.mode.lock().unwrap(), WindowMode::Menu) {
                            let _ = window.hide();
                        }
                    }
                }
                WindowEvent::CloseRequested { api, .. } => {
                    // Closing the decorated pop-out window should dock back, not quit.
                    api.prevent_close();
                    if let Some(state) = app.try_state::<AppState>() {
                        *state.mode.lock().unwrap() = WindowMode::Menu;
                    }
                    let _ = window.set_decorations(false);
                    let _ = window.set_resizable(false);
                    let _ = window.set_skip_taskbar(true);
                    let _ = window.set_always_on_top(false);
                    let _ = window.hide();
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![
            list_ports,
            kill_process,
            relaunch_as_admin,
            is_elevated,
            get_autostart,
            set_autostart,
            get_autostart_elevated,
            set_autostart_elevated,
            open_url,
            pop_out,
            dock_back,
            set_always_on_top,
            get_window_mode,
            quit_app,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
