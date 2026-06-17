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
        Graphics::Gdi::{CreateCompatibleDC, DeleteDC, DeleteObject, GetDIBits, GetObjectW, BITMAP, BITMAPINFO, BITMAPINFOHEADER, DIB_RGB_COLORS},
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
    let rows = GetDIBits(hdc, info.hbmColor, 0, h, Some(pixels.as_mut_ptr() as *mut _), &mut bmi, DIB_RGB_COLORS);
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

            let icon_b64 = exe_path.as_deref().and_then(|p| get_or_cache_icon(&mut cache, p));

            PortEntry { pid, port, process_name, exe_path, icon_b64 }
        })
        .collect();

    entries.sort_by_key(|e| e.port);
    entries
}

#[tauri::command]
fn kill_process(pid: u32) -> Result<(), String> {
    let sys = System::new_with_specifics(
        RefreshKind::new().with_processes(ProcessRefreshKind::new()),
    );
    let proc = sys
        .process(sysinfo::Pid::from_u32(pid))
        .ok_or_else(|| format!("process {pid} not found"))?;
    if proc.kill() {
        Ok(())
    } else {
        Err(format!("failed to kill process {pid}"))
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
fn get_window_mode(state: State<AppState>) -> String {
    match *state.mode.lock().unwrap() {
        WindowMode::Menu => "menu".to_string(),
        WindowMode::Popped => "popped".to_string(),
    }
}

fn show_menu_window(app: &AppHandle, position: tauri::PhysicalPosition<f64>) {
    let Some(win) = app.get_webview_window("main") else { return };

    // Position window so its bottom-right corner sits at the tray icon
    let x = (position.x - 380.0).max(0.0);
    let y = (position.y - 520.0).max(0.0);

    let _ = win.set_position(tauri::PhysicalPosition::new(x as i32, y as i32));
    let _ = win.show();
    let _ = win.set_focus();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
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
            let quit = MenuItemBuilder::with_id("quit", "Quit").build(app)?;
            let show = MenuItemBuilder::with_id("show", "Show").build(app)?;
            let menu = MenuBuilder::new(app).items(&[&show, &quit]).build()?;

            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        position,
                        ..
                    } = event
                    {
                        show_menu_window(tray.app_handle(), position);
                    }
                })
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "show" => {
                        if let Some(win) = app.get_webview_window("main") {
                            let _ = win.show();
                            let _ = win.set_focus();
                        }
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::Focused(false) = event {
                let app = window.app_handle();
                if let Some(state) = app.try_state::<AppState>() {
                    if matches!(*state.mode.lock().unwrap(), WindowMode::Menu) {
                        let _ = window.hide();
                    }
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            list_ports,
            kill_process,
            open_url,
            get_autostart,
            set_autostart,
            pop_out,
            dock_back,
            set_always_on_top,
            get_window_mode,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
