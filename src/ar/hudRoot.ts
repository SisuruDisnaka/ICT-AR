import css from '../styles.css?inline'
/** Mounts the HUD in an isolated Shadow DOM + top layer (popover), attached to <html>, so A-Frame / AR.js can't restyle, hide or cover it. A watchdog re-attaches/re-shows it if anything removes it. */
export function createHudRoot() {
  const host = document.createElement('div'); host.setAttribute('popover', 'manual'); host.id = 'ict-hud-host'
  host.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;max-width:none;max-height:none;margin:0;padding:0;border:0;overflow:visible;background:transparent;pointer-events:none;color:inherit'
  const sh = host.attachShadow({ mode: 'open' }), st = document.createElement('style'), container = document.createElement('div')
  st.textContent = css.replace(':root{', ':root,:host{'); sh.append(st, container)
  const show = () => { try { if (!host.matches(':popover-open')) (host as any).showPopover?.() } catch { /* popover unsupported: fixed + z-index still applies */ } }
  document.documentElement.appendChild(host); show()
  const wd = window.setInterval(() => { if (!host.isConnected) document.documentElement.appendChild(host); show() }, 400)
  return { container, host, destroy() { clearInterval(wd); host.remove() } }
}
