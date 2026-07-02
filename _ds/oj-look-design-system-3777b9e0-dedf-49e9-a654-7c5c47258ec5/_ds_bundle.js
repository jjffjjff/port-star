/* @ds-bundle: {"format":3,"namespace":"OjLookDesignSystem_3777b9","components":[{"name":"Alert","sourcePath":"components/general/Alert/Alert.jsx"},{"name":"Badge","sourcePath":"components/general/Badge/Badge.jsx"},{"name":"Button","sourcePath":"components/general/Button/Button.jsx"},{"name":"Card","sourcePath":"components/general/Card/Card.jsx"},{"name":"Container","sourcePath":"components/general/Container/Container.jsx"},{"name":"Input","sourcePath":"components/general/Input/Input.jsx"},{"name":"Sidebar","sourcePath":"components/general/Sidebar/Sidebar.jsx"},{"name":"TopBar","sourcePath":"components/general/TopBar/TopBar.jsx"},{"name":"Typography","sourcePath":"components/general/Typography/Typography.jsx"}],"sourceHashes":{"components/general/Alert/Alert.jsx":"b38a560719af","components/general/Badge/Badge.jsx":"c82a2a5fdb96","components/general/Button/Button.jsx":"d0cd2aedc69f","components/general/Card/Card.jsx":"5659e2fb2779","components/general/Container/Container.jsx":"0a7ec487f7fb","components/general/Input/Input.jsx":"6daea629298a","components/general/Sidebar/Sidebar.jsx":"650b7320da3b","components/general/TopBar/TopBar.jsx":"2561cc338d2b","components/general/Typography/Typography.jsx":"6bdcdf7582aa","ui_kits/meridian/Views.jsx":"6cc75e5c7323","ui_kits/meridian/Workspace.jsx":"1d74a027d3f8","ui_kits/meridian/data.js":"823dd6b224dc"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.OjLookDesignSystem_3777b9 = window.OjLookDesignSystem_3777b9 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/general/Alert/Alert.jsx
try { (() => {
/**
 * Alert — inline feedback. Left border carries the semantic color; no shadow.
 */
function Alert({
  variant = 'info',
  children,
  className = ''
}) {
  const classes = ['db-alert', `db-alert--${variant}`, className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", {
    className: classes,
    role: "alert"
  }, children);
}
Object.assign(__ds_scope, { Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/general/Alert/Alert.jsx", error: String((e && e.message) || e) }); }

// components/general/Badge/Badge.jsx
try { (() => {
/**
 * Badge — small status pill. Tinted fill + matching text at 15% accent alpha.
 */
function Badge({
  variant = 'default',
  children,
  className = ''
}) {
  const classes = ['db-badge', `db-badge--${variant}`, className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", {
    className: classes
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/general/Badge/Badge.jsx", error: String((e && e.message) || e) }); }

// components/general/Button/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Button — primary/secondary/text. Amber fill is the strategic accent (CTA only).
 */
function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  const classes = ['db-button', `db-button--${variant}`, `db-button--${size}`, className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    className: classes
  }, props), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/general/Button/Button.jsx", error: String((e && e.message) || e) }); }

// components/general/Card/Card.jsx
try { (() => {
/**
 * Card — surface panel. Standard variant sits on the surface ladder with a
 * hairline border (no shadow); globe-panel is full-bleed, borderless, 0 radius.
 */
function Card({
  variant = 'standard',
  padding,
  children,
  className = ''
}) {
  const classes = ['db-card', `db-card--${variant}`, className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", {
    className: classes,
    style: padding ? {
      padding
    } : undefined
  }, children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/general/Card/Card.jsx", error: String((e && e.message) || e) }); }

// components/general/Container/Container.jsx
try { (() => {
/**
 * Container — centered max-width layout wrapper (1200px default).
 */
function Container({
  maxWidth,
  children,
  className = ''
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `db-container ${className}`,
    style: maxWidth ? {
      maxWidth
    } : undefined
  }, children);
}
Object.assign(__ds_scope, { Container });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/general/Container/Container.jsx", error: String((e && e.message) || e) }); }

// components/general/Input/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Input — text field or textarea, with optional label and error.
 */
function Input({
  label,
  error,
  multiline = false,
  rows = 4,
  className = '',
  id,
  ...props
}) {
  const fieldId = id || (label ? `db-input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  return /*#__PURE__*/React.createElement("div", {
    className: `db-input-wrapper ${error ? 'db-input-wrapper--error' : ''} ${className}`
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "db-input-label",
    htmlFor: fieldId
  }, label), multiline ? /*#__PURE__*/React.createElement("textarea", _extends({
    className: "db-input db-input--textarea",
    id: fieldId,
    rows: rows
  }, props)) : /*#__PURE__*/React.createElement("input", _extends({
    className: "db-input",
    id: fieldId
  }, props)), error && /*#__PURE__*/React.createElement("span", {
    className: "db-input-error"
  }, error));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/general/Input/Input.jsx", error: String((e && e.message) || e) }); }

// components/general/Sidebar/Sidebar.jsx
try { (() => {
/**
 * Sidebar — vertical project directory. Supports top-level items and nested children.
 */
function Sidebar({
  items = [],
  activeItem,
  activeChild,
  header,
  width,
  className = ''
}) {
  return /*#__PURE__*/React.createElement("aside", {
    className: `db-sidebar ${className}`,
    style: width ? {
      width
    } : undefined
  }, header && /*#__PURE__*/React.createElement("div", {
    className: "db-sidebar__header"
  }, header), /*#__PURE__*/React.createElement("nav", {
    className: "db-sidebar__nav"
  }, items.map(item => /*#__PURE__*/React.createElement("div", {
    key: item.key
  }, /*#__PURE__*/React.createElement("button", {
    className: `db-sidebar__item ${item.children ? 'db-sidebar__item--group' : ''} ${activeItem === item.key ? 'db-sidebar__item--active' : ''}`,
    onClick: item.onClick,
    type: "button"
  }, item.label), item.children && /*#__PURE__*/React.createElement("div", {
    className: "db-sidebar__children"
  }, item.children.map(child => /*#__PURE__*/React.createElement("button", {
    key: child.key,
    className: `db-sidebar__child-item ${activeChild === child.key ? 'db-sidebar__child-item--active' : ''}`,
    onClick: child.onClick,
    type: "button"
  }, child.label)))))));
}
Object.assign(__ds_scope, { Sidebar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/general/Sidebar/Sidebar.jsx", error: String((e && e.message) || e) }); }

// components/general/TopBar/TopBar.jsx
try { (() => {
/**
 * TopBar — horizontal navigation. 56px tall, active item gets an amber underline.
 */
function TopBar({
  items = [],
  activeItem,
  logo,
  actions,
  className = ''
}) {
  return /*#__PURE__*/React.createElement("nav", {
    className: `db-topbar ${className}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "db-topbar__left"
  }, logo && /*#__PURE__*/React.createElement("div", {
    className: "db-topbar__logo"
  }, logo), /*#__PURE__*/React.createElement("div", {
    className: "db-topbar__nav"
  }, items.map(item => /*#__PURE__*/React.createElement("button", {
    key: item.key,
    className: `db-topbar__item ${activeItem === item.key ? 'db-topbar__item--active' : ''}`,
    onClick: item.onClick,
    type: "button"
  }, item.label)))), actions && /*#__PURE__*/React.createElement("div", {
    className: "db-topbar__actions"
  }, actions));
}
Object.assign(__ds_scope, { TopBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/general/TopBar/TopBar.jsx", error: String((e && e.message) || e) }); }

// components/general/Typography/Typography.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const defaultElements = {
  display: 'h1',
  h1: 'h1',
  h2: 'h2',
  body: 'p',
  small: 'p',
  caption: 'span',
  editorial: 'p',
  mono: 'span'
};

/**
 * Typography — the type system. Three typefaces, strict roles:
 * Inter (structure), Instrument Serif italic (editorial), DM Mono (metadata).
 */
function Typography({
  variant = 'body',
  as,
  secondary = false,
  children,
  className = '',
  ...props
}) {
  const Element = as || defaultElements[variant] || 'p';
  const classes = ['db-typography', `db-typography--${variant}`, secondary ? 'db-typography--secondary' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement(Element, _extends({
    className: classes
  }, props), children);
}
Object.assign(__ds_scope, { Typography });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/general/Typography/Typography.jsx", error: String((e && e.message) || e) }); }

// ui_kits/meridian/Views.jsx
try { (() => {
/* global React */
const {
  Card,
  Typography,
  Button,
  Badge,
  Input
} = window.OjLookDesignSystem_3777b9;

// ── Inspiration gallery ────────────────────────────────────────────────
function GalleryView({
  density,
  typeScale
}) {
  const items = window.MERIDIAN_DATA.gallery;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: meridianStyles.viewHead
  }, /*#__PURE__*/React.createElement(Typography, {
    variant: "h1"
  }, "Inspiration"), /*#__PURE__*/React.createElement(Typography, {
    variant: "editorial",
    secondary: true
  }, "a place to keep what you notice")), /*#__PURE__*/React.createElement("div", {
    style: {
      ...meridianStyles.galleryGrid,
      gap: 'var(--tweaks-gap)'
    }
  }, items.map(it => /*#__PURE__*/React.createElement("div", {
    key: it.id,
    style: {
      ...meridianStyles.tile,
      gap: 'var(--tweaks-card-gap)',
      transform: `scale(${typeScale})`,
      transformOrigin: 'top left'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...meridianStyles.tileImg,
      background: it.tone
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: meridianStyles.tileBody
  }, /*#__PURE__*/React.createElement(Typography, {
    variant: "editorial"
  }, it.title), /*#__PURE__*/React.createElement(Typography, {
    variant: "mono",
    secondary: true
  }, it.meta))))));
}

// ── Project directory ──────────────────────────────────────────────────
function DirectoryView({
  projects,
  onNew,
  density,
  typeScale
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: meridianStyles.viewHead
  }, /*#__PURE__*/React.createElement(Typography, {
    variant: "h1"
  }, "Projects"), /*#__PURE__*/React.createElement(Typography, {
    variant: "editorial",
    secondary: true
  }, projects.length, " in this workspace")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement(window.Button, {
    variant: "primary",
    onClick: onNew
  }, "New project")), /*#__PURE__*/React.createElement("div", {
    style: {
      ...meridianStyles.rows,
      gap: 'var(--tweaks-card-gap)'
    }
  }, projects.map(p => /*#__PURE__*/React.createElement(window.Card, {
    key: p.id
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...meridianStyles.projectRow,
      gap: 'var(--tweaks-card-gap)',
      transform: `scale(${typeScale})`,
      transformOrigin: 'top left'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Typography, {
    variant: "h2",
    as: "span"
  }, p.name), /*#__PURE__*/React.createElement(window.Badge, {
    variant: p.status
  }, p.statusLabel)), /*#__PURE__*/React.createElement(Typography, {
    variant: "mono",
    secondary: true
  }, p.slug, " \xB7 ", p.places, " places \xB7 updated ", p.updated)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(window.Button, {
    variant: "secondary",
    size: "sm"
  }, "Open"), /*#__PURE__*/React.createElement(window.Button, {
    variant: "text",
    size: "sm"
  }, "Archive")))))));
}

// ── Globe view ─────────────────────────────────────────────────────────
function GlobeView({
  globeGradient,
  typeScale
}) {
  const coords = window.MERIDIAN_DATA.coordinates;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: meridianStyles.viewHead
  }, /*#__PURE__*/React.createElement(Typography, {
    variant: "h1"
  }, "Globe"), /*#__PURE__*/React.createElement(Typography, {
    variant: "editorial",
    secondary: true
  }, "every place you've saved, at once")), /*#__PURE__*/React.createElement("div", {
    style: {
      ...meridianStyles.globeWrap,
      transform: `scale(${typeScale})`,
      transformOrigin: 'top left'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...meridianStyles.globe,
      background: globeGradient
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: meridianStyles.globeSheen
  })), /*#__PURE__*/React.createElement("div", {
    style: meridianStyles.coordList
  }, coords.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.label,
    style: meridianStyles.coordRow
  }, /*#__PURE__*/React.createElement("span", {
    style: meridianStyles.coordDot
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Typography, {
    variant: "mono-alt",
    as: "div"
  }, c.label), /*#__PURE__*/React.createElement(Typography, {
    variant: "mono",
    secondary: true
  }, c.coord)))))));
}

// ── New project form (overlay) ─────────────────────────────────────────
function NewProjectForm({
  onCancel,
  onCreate
}) {
  const [name, setName] = React.useState('');
  return /*#__PURE__*/React.createElement("div", {
    style: meridianStyles.overlay,
    onClick: onCancel
  }, /*#__PURE__*/React.createElement("div", {
    style: meridianStyles.dialog,
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement(Typography, {
    variant: "h2"
  }, "New project"), /*#__PURE__*/React.createElement(Typography, {
    variant: "small",
    secondary: true
  }, "A workspace for a body of work."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Project name",
    placeholder: "untitled",
    value: name,
    onChange: e => setName(e.target.value)
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Description",
    multiline: true,
    rows: 3,
    placeholder: "What is this for?"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: onCancel
  }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: () => onCreate(name || 'Untitled')
  }, "Create"))));
}
const meridianStyles = {
  viewHead: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--tweaks-view-head-gap)',
    marginBottom: 'var(--tweaks-view-head-margin)'
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 20
  },
  tile: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  tileImg: {
    height: 180,
    borderRadius: 'var(--db-radius-card)',
    border: '1px solid var(--db-border)'
  },
  tileBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4
  },
  rows: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  projectRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16
  },
  globeWrap: {
    display: 'grid',
    gridTemplateColumns: '1fr 280px',
    gap: 40,
    alignItems: 'center'
  },
  globe: {
    width: '100%',
    aspectRatio: '1',
    maxWidth: 420,
    margin: '0 auto',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 38% 32%, #6b543a 0%, #4a3f31 38%, #2f2823 72%, #241f1b 100%)',
    boxShadow: 'inset -18px -18px 60px rgba(0,0,0,0.55)',
    position: 'relative',
    overflow: 'hidden'
  },
  globeSheen: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    background: 'radial-gradient(circle at 34% 28%, rgba(243,173,46,0.22) 0%, rgba(243,173,46,0) 40%)'
  },
  coordList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },
  coordRow: {
    display: 'flex',
    gap: 12,
    alignItems: 'center'
  },
  coordDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--db-accent)',
    flexShrink: 0
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(20,17,15,0.6)',
    backdropFilter: 'blur(2px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20
  },
  dialog: {
    width: 440,
    maxWidth: '90vw',
    background: 'var(--db-surface)',
    border: '1px solid var(--db-border)',
    borderRadius: 'var(--db-radius-card)',
    padding: 28
  }
};
Object.assign(window, {
  GalleryView,
  DirectoryView,
  GlobeView,
  NewProjectForm
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/meridian/Views.jsx", error: String((e && e.message) || e) }); }

// ui_kits/meridian/Workspace.jsx
try { (() => {
/* global React */
const {
  TopBar,
  Sidebar
} = window.OjLookDesignSystem_3777b9;
function WorkspaceWithNav() {
  const [view, setView] = React.useState('directory');
  const [projects, setProjects] = React.useState(window.MERIDIAN_DATA.projects);
  const [showNew, setShowNew] = React.useState(false);
  const [accentColor, setAccentColor] = React.useState('#16844a');
  const [density, setDensity] = React.useState('normal');
  const [globeTone, setGlobeTone] = React.useState('warm');
  const [typeWeight, setTypeWeight] = React.useState('refined');
  const [bgPalette, setBgPalette] = React.useState('forest-dark');
  const [showTweaks, setShowTweaks] = React.useState(false);
  React.useEffect(() => {
    document.documentElement.style.setProperty('--db-accent', accentColor);
    const hover = {
      '#2ecc71': '#4dd88f',
      '#1fa853': '#2ecc71',
      '#16844a': '#1f9d57',
      '#0d5c35': '#1a7a4a'
    }[accentColor];
    if (hover) document.documentElement.style.setProperty('--db-accent-hover', hover);
  }, [accentColor]);

  // Background palette via CSS var
  React.useEffect(() => {
    const bgMap = {
      'cool-slate': '#0f1419',
      // Current cool slate-blue
      'warm-charcoal': '#1a1410',
      // Warm dark brown-black
      'deep-navy': '#0a0f1a',
      // Deep navy blue
      'forest-dark': '#0f1a15',
      // Deep forest undertone
      'neutral-grey': '#141416' // Neutral cool grey
    };
    document.documentElement.style.setProperty('--db-canvas', bgMap[bgPalette]);
  }, [bgPalette]);
  React.useEffect(() => {
    const densityMap = {
      'minimal': {
        gap: '32px',
        cardGap: '24px',
        padding: '48px 60px',
        typography: 'normal',
        viewHeadGap: '12px',
        viewHeadMargin: '20px'
      },
      'normal': {
        gap: '20px',
        cardGap: '12px',
        padding: '40px 48px',
        typography: 'normal',
        viewHeadGap: '8px',
        viewHeadMargin: '12px'
      },
      'compact': {
        gap: '12px',
        cardGap: '8px',
        padding: '24px 32px',
        typography: '0.92',
        viewHeadGap: '6px',
        viewHeadMargin: '8px'
      }
    };
    const d = densityMap[density];
    document.documentElement.style.setProperty('--tweaks-gap', d.gap);
    document.documentElement.style.setProperty('--tweaks-card-gap', d.cardGap);
    document.documentElement.style.setProperty('--tweaks-main-padding', d.padding);
    document.documentElement.style.setProperty('--tweaks-typo-scale', d.typography);
    document.documentElement.style.setProperty('--tweaks-view-head-gap', d.viewHeadGap);
    document.documentElement.style.setProperty('--tweaks-view-head-margin', d.viewHeadMargin);
  }, [density]);

  // Globe tone
  const globeGradient = globeTone === 'warm' ? 'radial-gradient(circle at 38% 32%, #6b543a 0%, #4a3f31 38%, #2f2823 72%, #241f1b 100%)' : 'radial-gradient(circle at 38% 32%, #4a5f7a 0%, #3a4f6a 38%, #283040 72%, #1f2835 100%)';

  // Typography weight
  const typeScale = typeWeight === 'bold' ? 1.05 : 1.0;
  const items = [{
    key: 'directory',
    label: 'Projects',
    onClick: () => setView('directory')
  }, {
    key: 'gallery',
    label: 'Inspiration gallery',
    onClick: () => setView('gallery')
  }, {
    key: 'globe',
    label: 'Globe view',
    onClick: () => setView('globe')
  }, {
    key: 'archive',
    label: 'Archive',
    onClick: () => setView('archive')
  }];
  function createProject(name) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    setProjects([{
      id: slug + Date.now(),
      name,
      slug,
      status: 'default',
      statusLabel: 'Draft',
      places: 0,
      updated: '2025-07-02'
    }, ...projects]);
    setShowNew(false);
    setView('directory');
  }
  return /*#__PURE__*/React.createElement("div", {
    style: appStyles.root
  }, /*#__PURE__*/React.createElement(TopBar, {
    logo: /*#__PURE__*/React.createElement("span", {
      style: {
        letterSpacing: '-1px'
      }
    }, "oj\xB7look"),
    items: [{
      key: 'work',
      label: 'Work',
      onClick: () => setView('directory')
    }, {
      key: 'explore',
      label: 'Explore'
    }, {
      key: 'settings',
      label: 'Settings'
    }],
    activeItem: "work",
    actions: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: '6px'
      }
    }, [{
      label: 'Forest',
      value: 'forest-dark',
      color: '#0f1a15'
    }, {
      label: 'Medium',
      value: 'forest-medium',
      color: '#162820'
    }, {
      label: 'Deep Black',
      value: 'deep-black',
      color: '#0a0c0a'
    }, {
      label: 'Grey',
      value: 'charcoal-grey',
      color: '#1a1a1a'
    }, {
      label: 'Camo Mud',
      value: 'camo-mud',
      color: '#2a2818'
    }].map(bg => /*#__PURE__*/React.createElement("button", {
      key: bg.value,
      onClick: () => setBgPalette(bg.value),
      title: bg.label,
      style: {
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: bg.color,
        border: bgPalette === bg.value ? '2px solid var(--db-accent)' : '1px solid var(--db-border)',
        cursor: 'pointer'
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: () => setShowTweaks(!showTweaks),
      style: {
        padding: '6px 12px',
        font: '500 13px var(--db-font-structure)',
        background: showTweaks ? 'var(--db-accent)' : 'transparent',
        color: showTweaks ? '#000' : 'var(--db-text-primary)',
        border: `1px solid ${showTweaks ? 'var(--db-accent)' : 'var(--db-border)'}`,
        borderRadius: 6,
        cursor: 'pointer'
      }
    }, "Tweaks"), /*#__PURE__*/React.createElement("span", {
      style: appStyles.avatar
    }, "OJ"))
  }), /*#__PURE__*/React.createElement("div", {
    style: appStyles.body
  }, /*#__PURE__*/React.createElement(Sidebar, {
    header: "Meridian workspace",
    items: items,
    activeItem: view
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      ...appStyles.main,
      padding: 'var(--tweaks-main-padding)'
    }
  }, view === 'directory' && /*#__PURE__*/React.createElement(window.DirectoryView, {
    projects: projects,
    onNew: () => setShowNew(true),
    density: density,
    typeScale: typeScale
  }), view === 'gallery' && /*#__PURE__*/React.createElement(window.GalleryView, {
    density: density,
    typeScale: typeScale
  }), view === 'globe' && /*#__PURE__*/React.createElement(window.GlobeView, {
    globeGradient: globeGradient,
    typeScale: typeScale
  }), view === 'archive' && /*#__PURE__*/React.createElement(window.DirectoryView, {
    projects: projects.filter(p => p.status === 'default'),
    onNew: () => setShowNew(true),
    density: density,
    typeScale: typeScale
  }))), showNew && /*#__PURE__*/React.createElement(window.NewProjectForm, {
    onCancel: () => setShowNew(false),
    onCreate: createProject
  }), showTweaks && /*#__PURE__*/React.createElement("div", {
    style: appStyles.tweaksPanel
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 14px var(--db-font-structure)',
      color: 'var(--db-text-primary)'
    }
  }, "Tweaks"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowTweaks(false),
    style: {
      background: 'none',
      border: 'none',
      color: 'var(--db-text-secondary)',
      cursor: 'pointer',
      fontSize: 20
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      font: '500 12px var(--db-font-mono)',
      color: 'var(--db-text-secondary)',
      marginBottom: 8
    }
  }, "Surface Density"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, ['minimal', 'normal', 'compact'].map(d => /*#__PURE__*/React.createElement("button", {
    key: d,
    onClick: () => setDensity(d),
    style: {
      flex: 1,
      padding: 8,
      font: '500 12px var(--db-font-structure)',
      background: density === d ? 'var(--db-accent)' : 'var(--db-surface)',
      color: density === d ? '#000' : 'var(--db-text-primary)',
      border: `1px solid ${density === d ? 'var(--db-accent)' : 'var(--db-border)'}`,
      borderRadius: 4,
      cursor: 'pointer'
    }
  }, d.charAt(0).toUpperCase() + d.slice(1))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      font: '500 12px var(--db-font-mono)',
      color: 'var(--db-text-secondary)',
      marginBottom: 8
    }
  }, "Globe Tone"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, ['warm', 'cool'].map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    onClick: () => setGlobeTone(t),
    style: {
      flex: 1,
      padding: 8,
      font: '500 12px var(--db-font-structure)',
      background: globeTone === t ? 'var(--db-accent)' : 'var(--db-surface)',
      color: globeTone === t ? '#000' : 'var(--db-text-primary)',
      border: `1px solid ${globeTone === t ? 'var(--db-accent)' : 'var(--db-border)'}`,
      borderRadius: 4,
      cursor: 'pointer'
    }
  }, t.charAt(0).toUpperCase() + t.slice(1))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      font: '500 12px var(--db-font-mono)',
      color: 'var(--db-text-secondary)',
      marginBottom: 8
    }
  }, "Typography"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, ['refined', 'bold'].map(w => /*#__PURE__*/React.createElement("button", {
    key: w,
    onClick: () => setTypeWeight(w),
    style: {
      flex: 1,
      padding: 8,
      font: '500 12px var(--db-font-structure)',
      background: typeWeight === w ? 'var(--db-accent)' : 'var(--db-surface)',
      color: typeWeight === w ? '#000' : 'var(--db-text-primary)',
      border: `1px solid ${typeWeight === w ? 'var(--db-accent)' : 'var(--db-border)'}`,
      borderRadius: 4,
      cursor: 'pointer'
    }
  }, w.charAt(0).toUpperCase() + w.slice(1))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      font: '500 12px var(--db-font-mono)',
      color: 'var(--db-text-secondary)',
      marginBottom: 8
    }
  }, "Background"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, [{
    label: 'Forest',
    value: 'forest-dark'
  }, {
    label: 'Medium',
    value: 'forest-medium'
  }, {
    label: 'Deep Black',
    value: 'deep-black'
  }, {
    label: 'Charcoal Grey',
    value: 'charcoal-grey'
  }, {
    label: 'Camo Mud',
    value: 'camo-mud'
  }].map(opt => /*#__PURE__*/React.createElement("button", {
    key: opt.value,
    onClick: () => setBgPalette(opt.value),
    style: {
      width: '100%',
      padding: 8,
      font: '500 12px var(--db-font-structure)',
      background: bgPalette === opt.value ? 'var(--db-accent)' : 'var(--db-surface)',
      color: bgPalette === opt.value ? '#000' : 'var(--db-text-primary)',
      border: `1px solid ${bgPalette === opt.value ? 'var(--db-accent)' : 'var(--db-border)'}`,
      borderRadius: 4,
      cursor: 'pointer',
      textAlign: 'left'
    }
  }, opt.label)))))));
}
const appStyles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--db-canvas)'
  },
  body: {
    display: 'flex',
    flex: 1,
    minHeight: 0
  },
  main: {
    flex: 1,
    overflow: 'auto'
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'var(--db-surface-raised)',
    border: '1px solid var(--db-border)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    font: '500 13px var(--db-font-mono)',
    color: 'var(--db-text-secondary)'
  },
  tweaksPanel: {
    position: 'fixed',
    bottom: 20,
    right: 20,
    width: 320,
    background: 'var(--db-surface)',
    border: '1px solid var(--db-border)',
    borderRadius: 'var(--db-radius-card)',
    padding: 16,
    zIndex: 30,
    boxShadow: '0 20px 25px rgba(0,0,0,0.4)'
  }
};
Object.assign(window, {
  Workspace: WorkspaceWithNav
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/meridian/Workspace.jsx", error: String((e && e.message) || e) }); }

// ui_kits/meridian/data.js
try { (() => {
// Fake data for the Meridian workspace UI kit.
window.MERIDIAN_DATA = {
  projects: [{
    id: 'meridian',
    name: 'Meridian',
    slug: 'meridian-01',
    status: 'accent',
    statusLabel: 'Active',
    places: 42,
    updated: '2025-07-01'
  }, {
    id: 'atlas',
    name: 'Atlas',
    slug: 'atlas-notes',
    status: 'success',
    statusLabel: 'Live',
    places: 128,
    updated: '2025-06-28'
  }, {
    id: 'coastline',
    name: 'Coastline',
    slug: 'coastline',
    status: 'default',
    statusLabel: 'Draft',
    places: 7,
    updated: '2025-06-19'
  }, {
    id: 'field-notes',
    name: 'Field Notes',
    slug: 'field-notes',
    status: 'warning',
    statusLabel: 'Syncing',
    places: 63,
    updated: '2025-06-15'
  }],
  gallery: [{
    id: 1,
    title: 'a quiet harbor at dusk',
    tone: 'linear-gradient(150deg,#5a4632,#2b2622)',
    meta: '35.6762° N · 139.6503° E'
  }, {
    id: 2,
    title: 'the long light of afternoon',
    tone: 'linear-gradient(150deg,#6b4a2f,#332a24)',
    meta: '41.9028° N · 12.4964° E'
  }, {
    id: 3,
    title: 'terracotta and shadow',
    tone: 'linear-gradient(150deg,#7a4a35,#2f2621)',
    meta: '31.6295° N · 8.0089° W'
  }, {
    id: 4,
    title: 'a warm room, empty',
    tone: 'linear-gradient(150deg,#4a4239,#2b2622)',
    meta: '48.8566° N · 2.3522° E'
  }, {
    id: 5,
    title: 'evening, from the hills',
    tone: 'linear-gradient(150deg,#5f5030,#2c2621)',
    meta: '37.9838° N · 23.7275° E'
  }, {
    id: 6,
    title: 'the color of old maps',
    tone: 'linear-gradient(150deg,#6e5535,#302923)',
    meta: '55.7558° N · 37.6173° E'
  }],
  coordinates: [{
    label: 'Tokyo',
    coord: '35.68° N · 139.65° E'
  }, {
    label: 'Roma',
    coord: '41.90° N · 12.50° E'
  }, {
    label: 'Marrakesh',
    coord: '31.63° N · 8.01° W'
  }, {
    label: 'Paris',
    coord: '48.86° N · 2.35° E'
  }, {
    label: 'Athína',
    coord: '37.98° N · 23.73° E'
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/meridian/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Container = __ds_scope.Container;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Sidebar = __ds_scope.Sidebar;

__ds_ns.TopBar = __ds_scope.TopBar;

__ds_ns.Typography = __ds_scope.Typography;

})();
