(function() {
  'use strict';

  // Find our script tag and extract config
  var script = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && (scripts[i].src.indexOf('embed.js') !== -1 || scripts[i].src.indexOf('/v1/') !== -1)) {
        return scripts[i];
      }
    }
  })();

  if (!script) return;

  // Extract agent slug: first try path-based /v1/{slug}.js, then data-agent attribute
  var agentSlug = null;
  var widgetBaseUrl = '';

  var srcUrl = script.src || '';
  var pathMatch = srcUrl.match(/\/v1\/([^/.]+)\.js(?:\?|$)/);
  if (pathMatch && pathMatch[1] !== 'embed') {
    agentSlug = pathMatch[1];
    widgetBaseUrl = srcUrl.replace(/\/v1\/[^/.]+\.js.*$/, '');
  } else {
    agentSlug = script.getAttribute('data-agent');
    widgetBaseUrl = srcUrl.replace('/v1/embed.js', '');
  }

  if (!agentSlug) {
    console.error('NestIQ: Missing agent slug. Use data-agent attribute or /v1/{slug}.js URL pattern.');
    return;
  }

  var position = script.getAttribute('data-position') || 'bottom-right';

  // Default colors
  var primaryColor = '#0f766e';
  var bgColor = '#f5f0eb';

  // Fetch branding
  fetch(widgetBaseUrl + '/api/agents/' + agentSlug + '/branding')
    .then(function(res) { return res.json(); })
    .then(function(data) {
      primaryColor = data.primaryColor || primaryColor;
      bgColor = data.secondaryColor || bgColor;
      updateColors();
    })
    .catch(function() {});

  // State
  var isOpen = false;
  var isMobile = window.innerWidth < 640;

  // Create styles
  var style = document.createElement('style');
  style.textContent = [
    '#nestiq-bubble{',
    '  position:fixed;z-index:2147483646;',
    '  width:60px;height:60px;border-radius:50%;',
    '  background:' + primaryColor + ';',
    '  color:white;border:none;cursor:pointer;',
    '  display:flex;align-items:center;justify-content:center;',
    '  box-shadow:0 4px 16px rgba(0,0,0,0.16);',
    '  transition:transform 0.2s,box-shadow 0.2s;',
    '  ' + (position === 'bottom-left' ? 'left:24px;' : 'right:24px;'),
    '  bottom:24px;',
    '}',
    '#nestiq-bubble:hover{transform:scale(1.08);box-shadow:0 6px 20px rgba(0,0,0,0.2);}',
    '#nestiq-bubble svg{width:28px;height:28px;}',
    '#nestiq-frame-container{',
    '  position:fixed;z-index:2147483647;',
    '  display:none;',
    '  ' + (position === 'bottom-left' ? 'left:24px;' : 'right:24px;'),
    '  bottom:96px;',
    '  width:400px;max-width:calc(100vw - 48px);',
    '  height:600px;max-height:calc(100vh - 120px);',
    '  border-radius:16px;overflow:hidden;',
    '  box-shadow:0 8px 32px rgba(0,0,0,0.16);',
    '  background:white;',
    '}',
    '#nestiq-frame-container.nestiq-open{display:block;}',
    '#nestiq-frame-container.nestiq-mobile{',
    '  top:0;left:0;right:0;bottom:0;',
    '  width:100%;height:100%;max-width:100%;max-height:100%;',
    '  border-radius:0;',
    '}',
    '#nestiq-frame{',
    '  width:100%;height:100%;border:none;',
    '}',
    '#nestiq-close{',
    '  display:none;position:absolute;top:12px;right:12px;',
    '  z-index:10;width:32px;height:32px;border-radius:50%;',
    '  background:rgba(0,0,0,0.4);color:white;border:none;',
    '  cursor:pointer;font-size:18px;',
    '  align-items:center;justify-content:center;',
    '}',
    '#nestiq-frame-container.nestiq-mobile #nestiq-close{display:flex;}',
  ].join('\n');
  document.head.appendChild(style);

  // Create bubble
  var bubble = document.createElement('button');
  bubble.id = 'nestiq-bubble';
  bubble.setAttribute('aria-label', 'Open chat');
  bubble.innerHTML = '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>';

  // Create frame container
  var frameContainer = document.createElement('div');
  frameContainer.id = 'nestiq-frame-container';

  var closeBtn = document.createElement('button');
  closeBtn.id = 'nestiq-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.onclick = function() { toggle(false); };

  var iframe = document.createElement('iframe');
  iframe.id = 'nestiq-frame';
  iframe.setAttribute('allow', 'microphone');
  iframe.setAttribute('loading', 'lazy');

  frameContainer.appendChild(closeBtn);
  frameContainer.appendChild(iframe);

  document.body.appendChild(bubble);
  document.body.appendChild(frameContainer);

  function updateColors() {
    bubble.style.background = primaryColor;
  }

  function toggle(forceState) {
    isOpen = typeof forceState === 'boolean' ? forceState : !isOpen;
    isMobile = window.innerWidth < 640;

    if (isOpen) {
      // Load iframe on first open
      if (!iframe.src) {
        iframe.src = widgetBaseUrl + '/chat/' + agentSlug;
      }
      frameContainer.classList.add('nestiq-open');
      if (isMobile) {
        frameContainer.classList.add('nestiq-mobile');
      }
      bubble.innerHTML = '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
      bubble.setAttribute('aria-label', 'Close chat');
    } else {
      frameContainer.classList.remove('nestiq-open', 'nestiq-mobile');
      bubble.innerHTML = '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>';
      bubble.setAttribute('aria-label', 'Open chat');
    }
  }

  bubble.onclick = function() { toggle(); };

  // Handle messages from iframe
  window.addEventListener('message', function(e) {
    if (!e.data || !e.data.type) return;

    switch (e.data.type) {
      case 'nestiq:close':
        toggle(false);
        break;
      case 'nestiq:lead':
        // Fire GTM/analytics event
        if (window.dataLayer) {
          window.dataLayer.push({
            event: 'nestiq_lead',
            nestiq_agent: agentSlug,
            nestiq_lead: e.data.data,
          });
        }
        break;
      case 'nestiq:resize':
        // For inline embeds
        if (e.data.height) {
          frameContainer.style.height = e.data.height + 'px';
        }
        break;
    }
  });

  // Handle resize
  window.addEventListener('resize', function() {
    isMobile = window.innerWidth < 640;
    if (isOpen) {
      if (isMobile) {
        frameContainer.classList.add('nestiq-mobile');
      } else {
        frameContainer.classList.remove('nestiq-mobile');
      }
    }
  });
})();
