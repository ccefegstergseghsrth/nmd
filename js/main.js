/**
 * 《长安志》v3.0 — 毕设展示级交互引擎
 * 星空粒子 | 金色线稿 | 孔明灯 | 图片替换 | 舆图缩放拖拽 | 路线生成
 */
(function(){
'use strict';

document.addEventListener('DOMContentLoaded', function() {
  initNav();
  initPageTransition();
  initScrollChapter();
  initImgSlots();
  // 页面特定初始化
  var body = document.body;
  if(body.classList.contains('homepage')||body.classList.contains('index-page')) { initHeroStars(); initHeroSkyline(); initHeroLanterns(); initPageStars(); }
  if(body.classList.contains('map-page')) { initMap(); }
});

/* ============================================================
   HERO BUTTON - Smooth scroll to map section
   ============================================================ */
function initHeroButton(){
  var btn=document.querySelector('.hero-btn');
  if(!btn)return;
  btn.addEventListener('click',function(e){
    e.preventDefault();
    var mapSection=document.getElementById('yutu');
    if(mapSection){
      mapSection.scrollIntoView({behavior:'smooth',block:'start'});
    }else{
      window.location.href='map.html';
    }
  });
}

/* ============================================================
   NAVIGATION
   ============================================================ */
function initNav(){
  var nav=document.querySelector('.main-nav'), toggle=document.querySelector('.nav-toggle'), links=document.querySelector('.nav-links');
  if(!nav)return;
  window.addEventListener('scroll',function(){nav.classList.toggle('scrolled',window.pageYOffset>50);},{passive:true});
  if(!toggle||!links)return;
  toggle.addEventListener('click',function(){
    links.classList.toggle('open');
    var s=toggle.querySelectorAll('span');
    if(links.classList.contains('open')){
      s[0].style.transform='rotate(45deg) translate(5px,5px)';s[1].style.opacity='0';s[2].style.transform='rotate(-45deg) translate(5px,-5px)';
    }else{s[0].style.transform='none';s[1].style.opacity='1';s[2].style.transform='none';}
  });
  links.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){links.classList.remove('open');});});
}

/* ============================================================
   PAGE TRANSITION
   ============================================================ */
function initPageTransition(){
  document.querySelectorAll('a[href]:not([target="_blank"]):not([href^="#"]):not([href^="javascript"]):not([href^="mailto"])').forEach(function(a){
    if(a.hostname===window.location.hostname||a.href.indexOf('//')===-1){
      a.addEventListener('click',function(e){
        var h=a.getAttribute('href');
        if(!h||h.startsWith('javascript:'))return;
        e.preventDefault();
        var t=document.querySelector('.page-transition');
        if(t){t.classList.add('active');setTimeout(function(){window.location.href=h;},400);}
        else window.location.href=h;
      });
    }
  });
}

/* ============================================================
   SCROLL CHAPTER REVEAL
   ============================================================ */
function initScrollChapter(){
  var chs=document.querySelectorAll('.scroll-chapter');
  if(!chs.length)return;
  var obs=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting)e.target.classList.add('revealed');});
  },{threshold:0.08,rootMargin:'0px 0px -40px 0px'});
  chs.forEach(function(c){obs.observe(c);});
  // Immediate reveal for already-visible
  requestAnimationFrame(function(){
    chs.forEach(function(c){var r=c.getBoundingClientRect();if(r.top<window.innerHeight-60)c.classList.add('revealed');});
  });
}

/* ============================================================
   HERO STARS — Canvas starfield with shooting stars
   ============================================================ */
function initHeroStars(){
  var container=document.querySelector('.hero-stars');
  if(!container){ container=document.querySelector('.hero'); if(container){
    var cs=document.createElement('canvas');cs.className='hero-stars';
    cs.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;overflow:hidden;';
    container.insertBefore(cs,container.firstChild);
    container=cs;
  }}
  if(!container||container.tagName!=='CANVAS')return;
  var c=container,ctx=c.getContext('2d');

  function resize(){
    var rect=c.parentElement.getBoundingClientRect();
    c.width=rect.width;
    c.height=rect.height;
  }
  resize();
  window.addEventListener('resize',function(){
    resize();
    initStars();
  });

  var stars=[];
  function initStars(){
    stars=[];
    var rect=c.getBoundingClientRect();
    var count=Math.floor(Math.random()*101)+150;
    for(var i=0;i<count;i++){
      var sizeType=Math.random();
      var r;
      if(sizeType<0.6){r=1;}
      else if(sizeType<0.9){r=2;}
      else{r=3;}
      stars.push({
        x:Math.random()*rect.width,
        y:Math.random()*rect.height,
        r:r,
        brightness:Math.random()*Math.PI*2,
        speed:Math.random()*0.02+0.01,
        breathSpeed:Math.random()*0.03+0.015,
        breathPhase:Math.random()*Math.PI*2
      });
    }
  }
  initStars();

  var meteors=[];
  function spawnMeteor(){
    var rect=c.getBoundingClientRect();
    meteors.push({
      x:Math.random()*rect.width,
      y:Math.random()*rect.height*0.35,
      len:Math.random()*100+60,
      speed:Math.random()*10+7,
      life:1,
      decay:Math.random()*0.012+0.006
    });
  }
  setInterval(function(){if(meteors.length<4&&Math.random()<0.25)spawnMeteor();},2500);
  spawnMeteor();

  function draw(){
    ctx.clearRect(0,0,c.width,c.height);
    stars.forEach(function(s){
      s.brightness+=s.speed;
      s.breathPhase+=s.breathSpeed;
      var breath=0.3+0.7*((Math.sin(s.breathPhase)+1)/2);
      var b=0.4+Math.abs(Math.sin(s.brightness))*0.5;
      b=b*breath;
      ctx.beginPath();
      ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle='rgba(200,161,90,'+b+')';
      ctx.fill();
      if(s.r>=2){
        ctx.beginPath();
        ctx.arc(s.x,s.y,s.r*2.5,0,Math.PI*2);
        ctx.fillStyle='rgba(200,161,90,'+(b*0.2)+')';
        ctx.fill();
      }
    });
    meteors=meteors.filter(function(m){m.life-=m.decay;return m.life>0;});
    meteors.forEach(function(m){
      m.x-=m.speed;
      m.y+=m.speed*0.55;
      if(m.x<0){m.x=window.innerWidth;}
      if(m.y>window.innerHeight){m.y=0;}
      var g=ctx.createLinearGradient(m.x,m.y,m.x+m.len,m.y-m.len*0.5);
      g.addColorStop(0,'rgba(221,187,122,'+(m.life*0.9)+')');
      g.addColorStop(0.3,'rgba(200,161,90,'+(m.life*0.6)+')');
      g.addColorStop(1,'rgba(200,161,90,0)');
      ctx.beginPath();
      ctx.moveTo(m.x,m.y);
      ctx.lineTo(m.x+m.len,m.y-m.len*0.5);
      ctx.strokeStyle=g;
      ctx.lineWidth=2;
      ctx.stroke();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ============================================================
   PAGE STARS — 全页面星空背景
   ============================================================ */
function initPageStars(){
  console.log('initPageStars start');
  var canvas=document.querySelector('.page-stars');
  if(!canvas||canvas.tagName!=='CANVAS')return;
  console.log('canvas found', canvas);
  var ctx=canvas.getContext('2d');

  function resize(){
    var h = Math.max(document.body.scrollHeight, window.innerHeight);
    canvas.width = window.innerWidth;
    canvas.height = h;
    canvas.style.height = h + 'px';
    console.log('size', canvas.width, canvas.height);
  }
  resize();
  
  // 页面完全加载后重新计算高度（图片等资源加载完成后）
  window.addEventListener('load', function(){
    resize();
    initStars();
  });
  
  window.addEventListener('resize',function(){
    resize();
    initStars();
  });

  var stars=[];
  function initStars(){
    stars=[];
    var count=Math.floor(Math.random()*51)+80;
    for(var i=0;i<count;i++){
      var sizeType=Math.random();
      var r;
      if(sizeType<0.7){r=0.8;}
      else if(sizeType<0.95){r=1.2;}
      else{r=1.8;}
      stars.push({
        x:Math.random()*canvas.width,
        y:Math.random()*canvas.height,
        r:r,
        brightness:Math.random()*Math.PI*2,
        speed:Math.random()*0.015+0.008,
        breathSpeed:Math.random()*0.025+0.012,
        breathPhase:Math.random()*Math.PI*2
      });
    }
    console.log('stars count', stars.length);
  }
  initStars();

  function draw(){
    console.log('animation running');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    stars.forEach(function(s){
      s.brightness+=s.speed;
      s.breathPhase+=s.breathSpeed;
      var breath=0.3+0.7*((Math.sin(s.breathPhase)+1)/2);
      var b=0.3+Math.abs(Math.sin(s.brightness))*0.4;
      b=b*breath;
      ctx.beginPath();
      ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle='rgba(200,161,90,'+b+')';
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ============================================================
   HERO SKYLINE — Animate golden line drawing
   ============================================================ */
function initHeroSkyline(){
  var sky=document.querySelector('.hero-skyline');
  if(!sky)return;
  // Already handled by CSS animation, but we can add hover interaction
  sky.addEventListener('mouseenter',function(){
    var paths=sky.querySelectorAll('.skyline-path');
    paths.forEach(function(p){p.style.opacity='0.9';p.style.filter='drop-shadow(0 0 6px rgba(212,168,90,0.4))';});
  });
  sky.addEventListener('mouseleave',function(){
    var paths=sky.querySelectorAll('.skyline-path');
    paths.forEach(function(p){p.style.opacity='0.6';p.style.filter='none';});
  });
}

/* ============================================================
   HERO LANTERNS
   ============================================================ */
function initHeroLanterns(){
  var container=document.querySelector('.hero-lanterns');
  if(!container){
    container=document.querySelector('.hero');
    if(container){
      var lc=document.createElement('div');
      lc.className='hero-lanterns';
      lc.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;z-index:4;pointer-events:none;overflow:hidden;';
      container.appendChild(lc);
      container=lc;
    }
  }
  if(!container)return;

  function createLantern(){
    var sizeType=Math.random();
    var width,height,glowSize;
    if(sizeType<0.5){
      width=Math.floor(Math.random()*11)+20;
      height=Math.floor(Math.random()*11)+28;
      glowSize=width*1.8;
    }else if(sizeType<0.85){
      width=Math.floor(Math.random()*16)+35;
      height=Math.floor(Math.random()*16)+42;
      glowSize=width*1.6;
    }else{
      width=Math.floor(Math.random()*21)+60;
      height=Math.floor(Math.random()*21)+72;
      glowSize=width*1.4;
    }

    var speedType=Math.random();
    var duration;
    if(speedType<0.33){
      duration=20+Math.random()*5;
    }else if(speedType<0.66){
      duration=14+Math.random()*3;
    }else{
      duration=9+Math.random()*2;
    }

    var opacity=0.5+Math.random()*0.5;
    var midOpacity=0.7+Math.random()*0.3;
    var driftX=(15+Math.random()*20)*(Math.random()>0.5?1:-1);

    var el=document.createElement('div');
    el.className='hl';
    el.style.left=Math.random()*100+'%';
    el.style.bottom='-'+height+'px';
    el.style.animationDuration=duration+'s';
    el.style.setProperty('--start-opacity',opacity);
    el.style.setProperty('--mid-opacity',midOpacity);
    el.style.setProperty('--drift-x',driftX+'px');
    el.innerHTML='<div class="hl-glow" style="width:'+glowSize+'px;height:'+glowSize+'px;"></div><div class="hl-body" style="width:'+width+'px;height:'+height+'px;"></div>';
    container.appendChild(el);

    setTimeout(function(){
      if(el.parentNode)el.parentNode.removeChild(el);
    },duration*1000+500);
  }

  for(var i=0;i<8;i++){
    setTimeout(function(){createLantern();},i*300);
  }

  setInterval(function(){
    var lanternCount=container.querySelectorAll('.hl').length;
    if(lanternCount<15){
      createLantern();
    }
  },800+Math.random()*700);
}

/* ============================================================
   IMAGE EDITOR — 图片编辑系统
   ============================================================ */
var ImageEditor = (function() {
  var isEditing = false;
  var imageOverrides = {};
  
  // 创建调试面板
  function createDebugPanel() {
    var panel = document.createElement('div');
    panel.id = 'image-editor-debug';
    panel.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 30px;
      z-index: 9998;
      background: rgba(10, 22, 40, 0.95);
      border: 1px solid rgba(212, 168, 90, 0.3);
      border-radius: 8px;
      padding: 12px 16px;
      color: #d8d3c7;
      font-size: 12px;
      max-width: 300px;
      display: none;
      font-family: monospace;
    `;
    
    var header = document.createElement('div');
    header.innerHTML = '<strong style="color: #d4a85a;">📊 图片编辑器调试</strong>';
    panel.appendChild(header);
    
    var stats = document.createElement('div');
    stats.id = 'debug-stats';
    stats.style.marginTop = '8px';
    stats.innerHTML = '<div>存储数据: 0 条</div><div>localStorage: 可用</div>';
    panel.appendChild(stats);
    
    var lastOp = document.createElement('div');
    lastOp.id = 'debug-last-op';
    lastOp.style.marginTop = '8px';
    lastOp.style.fontSize = '11px';
    lastOp.innerHTML = '<div>最近操作: 无</div>';
    panel.appendChild(lastOp);
    
    var toggleBtn = document.createElement('button');
    toggleBtn.innerHTML = '🔍';
    toggleBtn.style.cssText = `
      position: absolute;
      top: -30px;
      right: 0;
      background: #d4a85a;
      border: none;
      border-radius: 4px 4px 0 0;
      padding: 4px 8px;
      cursor: pointer;
      color: #0a1628;
      font-size: 12px;
    `;
    toggleBtn.addEventListener('click', function() {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });
    panel.appendChild(toggleBtn);
    
    document.body.appendChild(panel);
  }
  
  // 更新调试面板
  function updateDebugPanel(op, key, success) {
    var stats = document.getElementById('debug-stats');
    var lastOp = document.getElementById('debug-last-op');
    
    if (stats) {
      var count = Object.keys(imageOverrides).length;
      var storageAvailable = checkLocalStorage() ? '可用' : '不可用';
      var size = getStorageSize();
      stats.innerHTML = `
        <div>存储数据: ${count} 条</div>
        <div>localStorage: ${storageAvailable}</div>
        <div>存储大小: ${size}</div>
      `;
    }
    
    if (lastOp) {
      var time = new Date().toLocaleTimeString();
      var status = success ? '✅' : '❌';
      lastOp.innerHTML = `<div>(${time}) ${status} ${op}: ${key}</div>`;
    }
  }
  
  // 检查localStorage是否可用
  function checkLocalStorage() {
    try {
      var test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch(e) {
      return false;
    }
  }
  
  // 获取存储大小
  function getStorageSize() {
    try {
      var size = JSON.stringify(localStorage).length;
      if (size < 1024) return size + ' B';
      if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
      return (size / (1024 * 1024)).toFixed(2) + ' MB';
    } catch(e) {
      return '未知';
    }
  }
  
  // 初始化时加载数据
  function loadOverridesFromStorage() {
    try {
      imageOverrides = {};
      // 从 localStorage 逐个加载（每条分开保存，避免5MB单条限制）
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('img-ovrd-')) {
          const actualKey = key.replace('img-ovrd-', '');
          const value = localStorage.getItem(key);
          if (value) {
            imageOverrides[actualKey] = value;
            console.log('[ImageEditor] 加载存储数据:', actualKey, '->', value.substring(0, 50) + '...');
          }
        }
      }
      console.log('[ImageEditor] 已加载存储的图片数据:', Object.keys(imageOverrides).length, '条');
      console.log('[ImageEditor] 所有存储的key:', Object.keys(imageOverrides));
      updateDebugPanel('加载数据', '-', true);
    } catch (e) {
      console.error('[ImageEditor] 加载存储数据失败:', e);
      imageOverrides = {};
      updateDebugPanel('加载数据', '-', false);
    }
  }
  
  // 保存数据到存储（分开保存每条，避免超出5MB单条限制）
  function saveOverridesToStorage() {
    try {
      // 先清理过期的
      const existingKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('img-ovrd-')) {
          existingKeys.push(key);
        }
      }
      
      // 删除不在imageOverrides中的旧记录
      const currentKeys = new Set(Object.keys(imageOverrides).map(k => 'img-ovrd-' + k));
      existingKeys.forEach(key => {
        if (!currentKeys.has(key)) {
          localStorage.removeItem(key);
        }
      });
      
      // 逐张保存新图片
      let savedCount = 0;
      let failedKeys = [];
      
      for (const [key, value] of Object.entries(imageOverrides)) {
        try {
          const storageKey = 'img-ovrd-' + key;
          localStorage.setItem(storageKey, value);
          savedCount++;
        } catch (innerErr) {
          failedKeys.push(key);
          console.warn('[ImageEditor] 单张图片保存失败:', key, innerErr);
        }
      }
      
      if (failedKeys.length > 0) {
        console.warn('[ImageEditor] 部分图片保存失败:', failedKeys);
        // 从imageOverrides中移除失败的，避免重复尝试
        failedKeys.forEach(k => delete imageOverrides[k]);
      }
      
      console.log('[ImageEditor] 数据已保存到存储，成功:', savedCount, '条，失败:', failedKeys.length, '条');
      updateDebugPanel('保存数据', '-', true);
    } catch (e) {
      console.error('[ImageEditor] 保存数据失败:', e);
      updateDebugPanel('保存数据', '-', false);
      
      // 检查是否是存储满了
      if (e.name === 'QuotaExceededError' || e.message && e.message.indexOf('Quota') >= 0) {
        alert('图片保存失败：浏览器存储已达到上限，请清除缓存后重试');
      } else {
        alert('图片保存失败，请检查浏览器存储权限');
      }
    }
  }
  
  // 西安文化素材库 - 使用稳定的图片URL
  var materialLibrary = [
    { id: 'dayanta', name: '大雁塔', category: '建筑', thumbnail: 'https://images.unsplash.com/photo-1556740755-481aade08966?w=800&h=450&fit=crop' },
    { id: 'chengqiang', name: '西安城墙', category: '建筑', thumbnail: 'https://images.unsplash.com/photo-1511949268883-47d5174f606b?w=800&h=450&fit=crop' },
    { id: 'zhonglou', name: '钟楼', category: '建筑', thumbnail: 'https://images.unsplash.com/photo-1545665264-fa0f5f9e9783?w=800&h=450&fit=crop' },
    { id: 'gulou', name: '鼓楼', category: '建筑', thumbnail: 'https://images.unsplash.com/photo-1551632436-60cf7116721a?w=800&h=450&fit=crop' },
    { id: 'qinling', name: '秦岭山脉', category: '自然', thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop' },
    { id: 'bingmayong', name: '兵马俑', category: '文物', thumbnail: 'https://images.unsplash.com/photo-1559494001-d4a259e513fe?w=800&h=450&fit=crop' },
    { id: 'shanximuseum', name: '陕西历史博物馆', category: '建筑', thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=450&fit=crop' },
    { id: 'datangbuyecheng', name: '大唐不夜城', category: '景观', thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop' },
    { id: 'tangdynasty', name: '唐代人物', category: '插画', thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=450&fit=crop' },
    { id: 'dunhuang', name: '敦煌风格', category: '插画', thumbnail: 'https://images.unsplash.com/photo-1551632436-60cf7116721a?w=800&h=450&fit=crop' },
    { id: 'xianyang', name: '咸阳宫', category: '建筑', thumbnail: 'https://images.unsplash.com/photo-1511949268883-47d5174f606b?w=800&h=450&fit=crop' },
    { id: 'huaqing', name: '华清宫', category: '景观', thumbnail: 'https://images.unsplash.com/photo-1556740755-481aade08966?w=800&h=450&fit=crop' }
  ];

  function init() {
    console.log('[ImageEditor] 初始化图片编辑器...');
    createDebugPanel();
    loadOverridesFromStorage();
    loadCustomImages();
    createEditToggle();
    bindKeyboardShortcut();
    console.log('[ImageEditor] 初始化完成');
  }

  function createEditToggle() {
    var toggle = document.createElement('button');
    toggle.className = 'edit-toggle';
    toggle.innerHTML = '<span>📷</span> 编辑模式';
    toggle.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      z-index: 9999;
      background: linear-gradient(135deg, #d4a85a 0%, #b8860b 100%);
      color: #0a1628;
      border: none;
      padding: 12px 24px;
      border-radius: 30px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(212, 168, 90, 0.4);
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
    `;
    toggle.addEventListener('click', toggleEditMode);
    document.body.appendChild(toggle);
  }

  function bindKeyboardShortcut() {
    document.addEventListener('keydown', function(e) {
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        toggleEditMode();
      }
    });
  }

  function toggleEditMode() {
    isEditing = !isEditing;
    
    var toggle = document.querySelector('.edit-toggle');
    if (toggle) {
      toggle.style.background = isEditing 
        ? 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)' 
        : 'linear-gradient(135deg, #d4a85a 0%, #b8860b 100%)';
      toggle.style.color = isEditing ? '#fff' : '#0a1628';
    }
    
    if (isEditing) {
      showEditButtons();
      console.log('%c[长安志] 📷 编辑模式已开启', 'color: #d4a85a; font-weight: bold;');
    } else {
      hideEditButtons();
      closeAllModals();
      console.log('%c[长安志] 📷 编辑模式已关闭', 'color: #999;');
    }
  }

  function showEditButtons() {
    document.querySelectorAll('.img-slot, .card-image, .exhibit-image').forEach(function(slot) {
      if (!slot.querySelector('.edit-btn')) {
        createEditButton(slot);
      }
    });
  }

  function hideEditButtons() {
    document.querySelectorAll('.edit-btn').forEach(function(btn) {
      btn.remove();
    });
  }

  function createEditButton(slot) {
    var btn = document.createElement('button');
    btn.className = 'edit-btn';
    btn.innerHTML = '📷 更换';
    btn.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(10, 22, 40, 0.9);
      color: #d4a85a;
      border: 1px solid #d4a85a;
      padding: 10px 20px;
      border-radius: 25px;
      font-size: 14px;
      cursor: pointer;
      opacity: 0;
      transition: all 0.3s ease;
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    
    slot.style.position = 'relative';
    slot.addEventListener('mouseenter', function() {
      if (isEditing) btn.style.opacity = '1';
    });
    slot.addEventListener('mouseleave', function() {
      btn.style.opacity = '0';
    });
    
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      openEditModal(slot);
    });
    
    slot.appendChild(btn);
  }

  function openEditModal(slot) {
    // 关闭其他模态框
    closeAllModals();
    
    var modal = document.createElement('div');
    modal.className = 'edit-modal';
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.8);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;
    
    var content = document.createElement('div');
    content.style.cssText = `
      background: #0d1b3d;
      border: 1px solid #d4a85a;
      border-radius: 15px;
      width: 90%;
      max-width: 800px;
      max-height: 85vh;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    `;
    
    // 头部
    var header = document.createElement('div');
    header.style.cssText = `
      padding: 20px;
      border-bottom: 1px solid rgba(212, 168, 90, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    header.innerHTML = `
      <h3 style="color: #d4a85a; margin: 0; font-size: 18px;">编辑图片</h3>
      <button class="modal-close" style="background: none; border: none; color: #999; font-size: 24px; cursor: pointer;">&times;</button>
    `;
    
    // 主体
    var body = document.createElement('div');
    body.style.cssText = `
      padding: 20px;
      max-height: 60vh;
      overflow-y: auto;
    `;
    
    // 当前图片预览
    body.innerHTML = `
      <div style="margin-bottom: 20px;">
        <label style="color: #8899aa; font-size: 13px; margin-bottom: 8px; display: block;">当前图片</label>
        <div style="width: 100%; height: 180px; background: #0a1530; border-radius: 10px; overflow: hidden; position: relative;">
          <img id="current-img-preview" src="${slot.querySelector('img')?.src || ''}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <label style="color: #8899aa; font-size: 13px; margin-bottom: 12px; display: block;">选择方式</label>
        <div style="display: flex; gap: 10px;">
          <button id="upload-btn" style="flex: 1; padding: 12px; background: #d4a85a; color: #0a1628; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">📁 上传图片</button>
          <button id="library-btn" style="flex: 1; padding: 12px; background: transparent; color: #d4a85a; border: 1px solid #d4a85a; border-radius: 8px; font-weight: bold; cursor: pointer;">🖼️ 素材库</button>
        </div>
        <input type="file" id="file-input" accept="image/*" style="display: none;">
      </div>
      
      <!-- 素材库 -->
      <div id="material-library" style="display: none;">
        <label style="color: #8899aa; font-size: 13px; margin-bottom: 12px; display: block;">西安文化素材库</label>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px;">
          ${materialLibrary.map(item => `
            <div class="material-item" data-id="${item.id}" data-url="${item.thumbnail}" style="cursor: pointer;">
              <div style="width: 100%; aspect-ratio: 16/9; background: #0a1530; border-radius: 8px; overflow: hidden;">
                <img src="${item.thumbnail}" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
              <div style="margin-top: 8px; text-align: center;">
                <div style="color: #e8e8e8; font-size: 13px;">${item.name}</div>
                <div style="color: #556677; font-size: 11px;">${item.category}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    // 底部
    var footer = document.createElement('div');
    footer.style.cssText = `
      padding: 15px 20px;
      border-top: 1px solid rgba(212, 168, 90, 0.2);
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    `;
    
    var restoreBtn = document.createElement('button');
    restoreBtn.textContent = '恢复默认';
    restoreBtn.style.cssText = `
      padding: 10px 20px;
      background: transparent;
      color: #e74c3c;
      border: 1px solid #e74c3c;
      border-radius: 8px;
      cursor: pointer;
    `;
    restoreBtn.addEventListener('click', function() {
      restoreDefault(slot);
      closeAllModals();
    });
    
    var saveBtn = document.createElement('button');
    saveBtn.textContent = '保存';
    saveBtn.style.cssText = `
      padding: 10px 30px;
      background: #d4a85a;
      color: #0a1628;
      border: none;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
    `;
    saveBtn.addEventListener('click', function() {
      closeAllModals();
    });
    
    footer.appendChild(restoreBtn);
    footer.appendChild(saveBtn);
    
    content.appendChild(header);
    content.appendChild(body);
    content.appendChild(footer);
    modal.appendChild(content);
    
    // 事件绑定
    modal.addEventListener('click', function(e) {
      if (e.target === modal) closeAllModals();
    });
    
    content.querySelector('.modal-close').addEventListener('click', closeAllModals);
    
    // 上传按钮
    var uploadBtn = content.querySelector('#upload-btn');
    var fileInput = content.querySelector('#file-input');
    uploadBtn.addEventListener('click', function() {
      fileInput.click();
    });
    
    fileInput.addEventListener('change', function(e) {
      var file = e.target.files[0];
      if (file) {
        // 检查文件大小（限制5MB）
        if (file.size > 5 * 1024 * 1024) {
          alert('图片太大了！请选择5MB以内的图片，或先压缩后再上传。');
          fileInput.value = '';
          return;
        }
        var reader = new FileReader();
        reader.onload = function(event) {
          var base64 = event.target.result;
          updateImage(slot, base64);
          content.querySelector('#current-img-preview').src = base64;
        };
        reader.readAsDataURL(file);
      }
    });
    
    // 素材库按钮
    var libraryBtn = content.querySelector('#library-btn');
    var library = content.querySelector('#material-library');
    libraryBtn.addEventListener('click', function() {
      library.style.display = library.style.display === 'none' ? 'block' : 'none';
    });
    
    // 素材库选择
    content.querySelectorAll('.material-item').forEach(function(item) {
      item.addEventListener('click', function() {
        var url = item.dataset.url;
        updateImage(slot, url);
        content.querySelector('#current-img-preview').src = url;
      });
    });
    
    document.body.appendChild(modal);
  }

  function closeAllModals() {
    document.querySelectorAll('.edit-modal').forEach(function(modal) {
      modal.remove();
    });
  }

  // 压缩图片函数 - 优化版本
  function compressImage(base64, maxWidth, maxHeight, quality) {
    return new Promise(function(resolve) {
      if (!base64.startsWith('data:image/')) {
        resolve(base64);
        return;
      }
      
      var img = new Image();
      img.onload = function() {
        var width = img.width;
        var height = img.height;
        var mimeType = 'image/jpeg';
        
        // 判断是否为PNG且需要转换
        var isPng = base64.startsWith('data:image/png');
        if (isPng && !hasTransparency(img)) {
          mimeType = 'image/jpeg';
          console.log('[ImageEditor] PNG图片无透明度，将转换为JPEG');
        } else if (isPng) {
          mimeType = 'image/png';
          console.log('[ImageEditor] PNG图片包含透明度，保持PNG格式');
        }
        
        // 计算缩放比例（最长边限制）
        var scale = Math.min(maxWidth / width, maxHeight / height, 1);
        if (scale < 1) {
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        
        // 创建canvas
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        var ctx = canvas.getContext('2d');
        
        // 如果是JPEG，先填充白色背景
        if (mimeType === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // 压缩并返回
        var compressed = canvas.toDataURL(mimeType, quality);
        resolve(compressed);
      };
      img.onerror = function() {
        resolve(base64);
      };
      img.src = base64;
    });
  }
  
  // 检测图片是否包含透明度
  function hasTransparency(img) {
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var pixels = imageData.data;
    
    // 采样检测透明度（每隔10个像素检测一个）
    for (var i = 3; i < pixels.length; i += 4 * 10) {
      if (pixels[i] < 255) {
        return true;
      }
    }
    return false;
  }

  function updateImage(slot, src) {
    var img = slot.querySelector('img');
    if (img) {
      // 保存原始地址
      if (!img.getAttribute('data-original-src')) {
        img.setAttribute('data-original-src', img.src);
        console.log('[ImageEditor] 设置原始src:', img.src);
      }
      
      // 替换图片节点的src，不替换整个节点
      img.src = src;
      img.style.display = 'block';
      img.classList.add('loaded');
      
      // 获取key（此时data-original-src已设置）
      var key = getImageKey(slot);
      console.log('[ImageEditor] updateImage called for:', key);
      
      // 如果是base64图片，先压缩再保存
      if (src.startsWith('data:image/')) {
        console.log('[ImageEditor] 开始压缩图片...');
        // 使用优化的压缩参数：最长边1600px，JPEG质量0.75
        compressImage(src, 1600, 1600, 0.75).then(function(compressedSrc) {
          var originalSize = Math.round(src.length / 1024);
          var compressedSize = Math.round(compressedSrc.length / 1024);
          console.log('[ImageEditor] 压缩完成，原始大小:', originalSize, 'KB，压缩后:', compressedSize, 'KB');
          // 再次检查压缩后的大小（限制2MB，否则降低质量再次压缩）
          if (compressedSrc.length > 2 * 1024 * 1024) {
            console.log('[ImageEditor] 压缩后仍超过2MB，进行二次压缩...');
            compressImage(compressedSrc, 1200, 1200, 0.65).then(function(finalSrc) {
              var finalSize = Math.round(finalSrc.length / 1024);
              console.log('[ImageEditor] 二次压缩完成，最终大小:', finalSize, 'KB');
              imageOverrides[key] = finalSrc;
              saveOverridesToStorage();
              cleanupUnusedImages();
              updateDebugPanel('上传图片', key, true);
              console.log('[ImageEditor] Image saved (double compressed):', key);
            }).catch(function(err) {
              console.error('[ImageEditor] 二次压缩失败:', err);
              imageOverrides[key] = compressedSrc;
              saveOverridesToStorage();
              updateDebugPanel('上传图片', key, false);
            });
          } else {
            imageOverrides[key] = compressedSrc;
            saveOverridesToStorage();
            cleanupUnusedImages();
            updateDebugPanel('上传图片', key, true);
            console.log('[ImageEditor] Image saved (compressed):', key);
          }
        }).catch(function(err) {
          console.error('[ImageEditor] 压缩失败，直接保存原始图片:', err);
          imageOverrides[key] = src;
          saveOverridesToStorage();
          updateDebugPanel('上传图片', key, false);
        });
      } else {
        // 对于URL图片，直接保存
        imageOverrides[key] = src;
        saveOverridesToStorage();
        cleanupUnusedImages();
        updateDebugPanel('选择素材', key, true);
        console.log('[ImageEditor] Image saved:', key, '- 图片数据已保存');
      }
    }
  }

  // 清理未使用的图片缓存
  function cleanupUnusedImages() {
    try {
      var currentKeys = new Set(Object.keys(imageOverrides));
      var removedCount = 0;
      
      // 找出超过30天未使用的图片
      var thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('img-ovrd-')) {
          const actualKey = key.replace('img-ovrd-', '');
          // 检查是否存在于当前imageOverrides中
          if (!currentKeys.has(actualKey)) {
            localStorage.removeItem(key);
            removedCount++;
          }
        }
      }
      
      if (removedCount > 0) {
        console.log('[ImageEditor] 清理了', removedCount, '个未使用的图片缓存');
      }
    } catch (e) {
      console.error('[ImageEditor] 清理未使用图片缓存失败:', e);
    }
  }
  
  function restoreDefault(slot) {
    var img = slot.querySelector('img');
    if (img) {
      var originalSrc = img.getAttribute('data-original-src');
      if (originalSrc) {
        img.src = originalSrc;
      }
      
      var key = getImageKey(slot);
      if (imageOverrides[key]) {
        delete imageOverrides[key];
        saveOverridesToStorage();
        cleanupUnusedImages();
        updateDebugPanel('恢复默认', key, true);
        console.log('[ImageEditor] Image restored:', key);
      }
    }
  }

  function getImageKey(slot) {
    // 首先尝试从父元素获取唯一标识（优先使用 data-image-id 确保唯一性）
    var uniqueId = '';
    
    // 优先使用 data-image-id（确保每个卡片独立）
    var img = slot.querySelector('img');
    if (img) {
      var imgId = img.getAttribute('data-image-id');
      if (imgId) {
        uniqueId = imgId;
        console.log('[ImageEditor] Found data-image-id:', uniqueId);
      }
    }
    
    // 如果没有 data-image-id，尝试找 data-id
    if (!uniqueId) {
      var parentWithId = slot.closest('[data-id]');
      if (parentWithId) {
        uniqueId = parentWithId.getAttribute('data-id');
        console.log('[ImageEditor] Found data-id:', uniqueId);
      }
    }
    
    // 如果没有 data-id，尝试找 data-link
    if (!uniqueId) {
      var parentCard = slot.closest('[data-link]');
      if (parentCard) {
        uniqueId = parentCard.getAttribute('data-link');
        console.log('[ImageEditor] Found data-link:', uniqueId);
      }
    }
    
    // 如果没有父元素标识，使用slot自己的data-slot-id（如果已设置）
    if (!uniqueId) {
      uniqueId = slot.getAttribute('data-slot-id');
    }
    
    // 如果还是没有，生成一个基于位置的唯一ID
    if (!uniqueId) {
      var allSlots = document.querySelectorAll('.img-slot, .card-image, .exhibit-image');
      var index = Array.from(allSlots).indexOf(slot);
      uniqueId = 'slot-' + index;
    }
    
    // 根据页面类型生成 key
    var key = 'img-';
    var currentPageId = getUrlParam('id');
    
    // 检查是否为 Hero 区域
    var isHero = slot.classList.contains('hero') || 
                 slot.closest('.hero') !== null || 
                 slot.classList.contains('hero-image') ||
                 slot.classList.contains('masthead');
    
    // 当推荐卡片、关联卡片引用列表页封面时，直接使用列表页格式
    if (
      uniqueId && 
      (
        uniqueId.startsWith('archive-list-') || 
        uniqueId.startsWith('culture-list-') || 
        uniqueId.startsWith('visit-list-')
      )
    ) {
      key += uniqueId;
      console.log('[ImageEditor] List reference key:', key);
      return key;
    }
    
    // 详情页：封面与Hero共用同一图片资源
    if (document.body.classList.contains('culture-detail') || 
        document.body.classList.contains('visit-detail') || 
        document.body.classList.contains('archive-detail')) {
      // 如果是详情页且有有效的页面ID，封面和Hero都使用统一的key
      if (currentPageId && currentPageId !== 'unknown') {
        // 提取模块类型
        var moduleType = '';
        if (document.body.classList.contains('culture-detail')) {
          moduleType = 'culture';
        } else if (document.body.classList.contains('visit-detail')) {
          moduleType = 'visit';
        } else if (document.body.classList.contains('archive-detail')) {
          moduleType = 'archive';
        }
        
        // 如果是Hero或者有data-image-id且与页面ID匹配，使用统一的封面key
        if (isHero || (uniqueId && (uniqueId === currentPageId || uniqueId.includes(currentPageId)))) {
          key += moduleType + '-' + currentPageId + '-cover';
          console.log('[ImageEditor] Hero/封面共用key:', key);
          return key;
        }
      }
      
      // 其他图片使用详细key
      if (document.body.classList.contains('culture-detail')) {
        key += 'culture-' + currentPageId + '-';
      } else if (document.body.classList.contains('visit-detail')) {
        key += 'visit-' + currentPageId + '-';
      } else if (document.body.classList.contains('archive-detail')) {
        key += 'archive-' + currentPageId + '-';
      }
    } else if (document.body.classList.contains('index-page') || document.body.classList.contains('homepage')) {
      key += 'home-';
    } else if (document.body.classList.contains('culture-page')) {
      key += 'culture-list-';
    } else if (document.body.classList.contains('visit-page')) {
      key += 'visit-list-';
    } else if (document.body.classList.contains('archive-page')) {
      key += 'archive-list-';
    } else if (document.body.classList.contains('map-page')) {
      key += 'map-';
    }
    
    // 使用唯一ID作为key的一部分
    var idHash = uniqueId.replace(/[^a-zA-Z0-9]/g, '_');
    key += idHash;
    
    console.log('[ImageEditor] Generated key:', key, '(from:', uniqueId, ')');
    return key;
  }

  function getUrlParam(name) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name) || 'unknown';
  }

  function loadCustomImages() {
    console.log('[ImageEditor] 开始加载自定义图片...');
    console.log('[ImageEditor] 当前存储的数据:', imageOverrides);
    
    document.querySelectorAll('.img-slot, .card-image, .exhibit-image').forEach(function(slot) {
      var img = slot.querySelector('img');
      if (!img) return;
      
      // 现在生成key
      var key = getImageKey(slot);
      console.log('[ImageEditor] 检查slot:', key);
      
      // 检查是否有自定义图片
      var hasCustomImage = imageOverrides[key];
      
      // 如果没有自定义图片且当前是占位图，设置默认图片
      if (!hasCustomImage && img.src.includes('placeholder')) {
        var imgId = img.getAttribute('data-image-id');
        if (imgId && typeof ImageAssets !== 'undefined') {
          // 根据页面类型获取对应的默认图片
          var defaultSrc = null;
          if (document.body.classList.contains('archive-page') || document.body.classList.contains('archive-detail')) {
            defaultSrc = ImageAssets.getArchiveImage(imgId);
          } else {
            defaultSrc = ImageAssets.getCoverImage(imgId);
          }
          if (defaultSrc && !defaultSrc.includes('placeholder')) {
            img.src = defaultSrc;
            console.log('[ImageEditor] 设置默认图片:', key, '->', defaultSrc);
          }
        }
      }
      
      // 确保所有图片都有 data-original-src（保存当前的真实路径）
      if (!img.getAttribute('data-original-src')) {
        img.setAttribute('data-original-src', img.src);
        console.log('[ImageEditor] 设置原始src:', key, '->', img.src);
      }
      
      // 如果有自定义图片，应用自定义图片
      if (hasCustomImage) {
        img.src = imageOverrides[key];
        img.style.display = 'block';
        img.classList.add('loaded');
        console.log('[ImageEditor] 已加载自定义图片:', key);
      }
    });
    
    console.log('[ImageEditor] 自定义图片加载完成');
  }

  return {
    init: init,
    isEditing: function() { return isEditing; }
  };
})();

/* ============================================================
   IMAGE SLOTS — Handle image load/error
   ============================================================ */
function initImgSlots(){
  document.querySelectorAll('.img-slot, .card-image, .exhibit-image').forEach(function(slot){
    var img=slot.querySelector('img');
    if(img){
      if(img.complete&&img.naturalWidth>0)img.classList.add('loaded');
      else{img.addEventListener('load',function(){img.classList.add('loaded');});img.addEventListener('error',function(){img.style.display='none';});}
    }
  });
  
  // 初始化图片编辑器
  ImageEditor.init();
}

/* ============================================================
   CARDS — click navigation for magazine/collection cards
   ============================================================ */
function initCards(){
  document.querySelectorAll('.magazine-card,.collection-card,.jp-node,.reading-card').forEach(function(card){
    card.addEventListener('click',function(e){
      if(e.target.closest('.img-replace-btn'))return;
      var link=card.getAttribute('data-link');
      if(link){var t=document.querySelector('.page-transition');if(t){t.classList.add('active');setTimeout(function(){window.location.href=link;},400);}else window.location.href=link;}
    });
  });
}

/* ============================================================
   JOURNEY MAP — 晨午暮夜 四阶段 路线图
   ============================================================ */
function initJourneyMap(){
  // Journey map nodes are now cards that navigate via initCards
  // The phases structure is handled by HTML
}

/* ============================================================
   ANCIENT MAP v3 — 舆图 缩放拖拽 地标弹窗 + 编辑模式
   ============================================================ */
function initMap(){
  var mapPage=document.querySelector('.map-fullpage');
  if(!mapPage)return;

  var mapTransform=mapPage.querySelector('.map-transform');
  if(!mapTransform)return;

  // State
  var scale=1, panX=0, panY=0, minScale=0.8, maxScale=2.5;
  var isDragging=false, dragStartX=0, dragStartY=0, startPanX=0, startPanY=0;
  
  // 编辑模式状态
  var editMode=false;
  var editingMarker=null;
  var markerStartX=0, markerStartY=0;
  var markerStartLeft=0, markerStartTop=0;

  // 获取编辑模式UI元素
  var editPanel=document.getElementById('mapEditPanel');
  var editModeHint=document.getElementById('editModeHint');

  function applyTransform(){
    mapTransform.style.transform='translate('+panX+'px,'+panY+'px) scale('+scale+')';
  }

  // Mouse wheel zoom
  mapTransform.addEventListener('wheel',function(e){
    if(editMode)return;
    e.preventDefault();
    var rect=mapTransform.getBoundingClientRect();
    var mx=e.clientX-rect.left, my=e.clientY-rect.top;
    var prevScale=scale;
    var ds=e.deltaY>0?-0.1:0.1;
    scale=Math.max(minScale,Math.min(maxScale,scale+ds));
    // Zoom toward cursor
    var ratio=scale/prevScale;
    panX=mx-(mx-panX)*ratio;
    panY=my-(my-panY)*ratio;
    applyTransform();
  },{passive:false});

  // Mouse drag (地图拖拽)
  mapTransform.addEventListener('mousedown',function(e){
    if(e.target.closest('.map-marker')||e.target.closest('.map-popup'))return;
    if(editMode)return;
    isDragging=true;dragStartX=e.clientX;dragStartY=e.clientY;startPanX=panX;startPanY=panY;
    e.preventDefault();
  });
  window.addEventListener('mousemove',function(e){
    // 地标拖拽
    if(editingMarker){
      var dx=e.clientX-markerStartX;
      var dy=e.clientY-markerStartY;
      var newLeft=markerStartLeft+dx;
      var newTop=markerStartTop+dy;
      // 转换为百分比
      var rect=mapTransform.getBoundingClientRect();
      var pctX=(newLeft/rect.width*100).toFixed(1);
      var pctY=(newTop/rect.height*100).toFixed(1);
      editingMarker.style.left=pctX+'%';
      editingMarker.style.top=pctY+'%';
      // 更新坐标显示
      updateCoordDisplay(editingMarker.getAttribute('data-name'),pctX,pctY);
      return;
    }
    // 地图拖拽
    if(!isDragging||editMode)return;
    panX=startPanX+(e.clientX-dragStartX);
    panY=startPanY+(e.clientY-dragStartY);
    applyTransform();
  });
  window.addEventListener('mouseup',function(){
    isDragging=false;
    editingMarker=null;
  });

  // Touch support
  var lastDist=0;
  mapTransform.addEventListener('touchstart',function(e){
    if(e.touches.length===2){lastDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);}
    else if(e.touches.length===1&&!editMode){isDragging=true;dragStartX=e.touches[0].clientX;dragStartY=e.touches[0].clientY;startPanX=panX;startPanY=panY;}
  },{passive:false});
  mapTransform.addEventListener('touchmove',function(e){
    if(e.touches.length===2){
      var dist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      if(lastDist>0){var ds=(dist-lastDist)*0.005;scale=Math.max(minScale,Math.min(maxScale,scale+ds));applyTransform();}
      lastDist=dist;
    }else if(e.touches.length===1&&isDragging&&!editMode){
      panX=startPanX+(e.touches[0].clientX-dragStartX);panY=startPanY+(e.touches[0].clientY-dragStartY);applyTransform();
    }
  },{passive:false});
  mapTransform.addEventListener('touchend',function(){isDragging=false;lastDist=0;});

  // Map controls
  var ctrlZoomIn=mapPage.querySelector('.ctrl-zoomin'),ctrlZoomOut=mapPage.querySelector('.ctrl-zoomout'),ctrlReset=mapPage.querySelector('.ctrl-reset');
  if(ctrlZoomIn)ctrlZoomIn.addEventListener('click',function(){scale=Math.min(maxScale,scale+0.2);applyTransform();});
  if(ctrlZoomOut)ctrlZoomOut.addEventListener('click',function(){scale=Math.max(minScale,scale-0.2);applyTransform();});
  if(ctrlReset)ctrlReset.addEventListener('click',function(){scale=1;panX=0;panY=0;applyTransform();});

  // 默认地标坐标
  var defaultPositions={
    '钟楼': {left: '52.5%', top: '22%'},
    '鼓楼': {left: '58.8%', top: '22%'},
    '城墙': {left: '43.5%', top: '45%'},
    '大雁塔': {left: '61.2%', top: '70%'},
    '小雁塔': {left: '52.8%', top: '68%'},
    '陕西历史博物馆': {left: '78.5%', top: '55%'},
    '大唐不夜城': {left: '79.2%', top: '88%'}
  };

  // 从localStorage加载坐标
  function loadPositions(){
    try{
      var saved=localStorage.getItem('changan-map-points');
      if(saved){
        return JSON.parse(saved);
      }
    }catch(e){}
    return null;
  }

  // 保存坐标到localStorage
  function savePositions(){
    var positions={};
    var markers=mapTransform.querySelectorAll('.map-marker');
    markers.forEach(function(marker){
      var name=marker.getAttribute('data-name');
      if(name){
        positions[name]={
          left:marker.style.left,
          top:marker.style.top
        };
      }
    });
    localStorage.setItem('changan-map-points',JSON.stringify(positions));
  }

  // 更新坐标显示
  function updateCoordDisplay(name,x,y){
    if(!name)return;
    var coordEl=document.getElementById('coord-'+name);
    if(coordEl){
      coordEl.textContent='x='+x+'% y='+y+'%';
    }
  }

  // 初始化地标位置
  function initMarkerPositions(){
    var savedPositions=loadPositions();
    var positions=savedPositions||defaultPositions;
    
    var markers=mapTransform.querySelectorAll('.map-marker');
    markers.forEach(function(marker){
      var name=marker.getAttribute('data-name');
      if(positions[name]){
        marker.style.left=positions[name].left;
        marker.style.top=positions[name].top;
        // 更新编辑面板显示
        var x=parseFloat(positions[name].left);
        var y=parseFloat(positions[name].top);
        updateCoordDisplay(name,x.toFixed(1),y.toFixed(1));
      }
    });
  }
  
  // 等待地图图片加载后设置地标位置
  var mapImage=mapPage.querySelector('.map-image');
  if(mapImage&&mapImage.complete){
    initMarkerPositions();
  }else if(mapImage){
    mapImage.addEventListener('load',initMarkerPositions);
  }else{
    initMarkerPositions();
  }

  // 卷轴卡片元素
  var scrollCard=document.getElementById('mapScrollCard');
  var scrollTitle=document.getElementById('scrollTitle');
  var scrollEra=document.getElementById('scrollEra');
  var scrollTag=document.getElementById('scrollTag');
  var scrollDesc=document.getElementById('scrollDesc');
  var scrollAction=document.getElementById('scrollAction');
  var scrollClose=document.getElementById('scrollClose');
  var mapOverlay=document.getElementById('mapOverlay');
  var currentDetailLink='';
  var isFocusing=false;

  // 历史年代映射
  var eraMap={
    '钟楼':'明 · 洪武十七年',
    '鼓楼':'明 · 洪武十三年',
    '城墙':'明 · 洪武年间',
    '大雁塔':'唐 · 永徽三年',
    '小雁塔':'唐 · 景龙年间',
    '陕西历史博物馆':'现代',
    '大唐不夜城':'现代 · 盛唐文化'
  };

  // 文化标签映射
  var tagMap={
    '钟楼':'晨钟暮鼓',
    '鼓楼':'文武盛地',
    '城墙':'城垣守望',
    '大雁塔':'雁塔题名',
    '小雁塔':'三裂三合',
    '陕西历史博物馆':'华夏宝库',
    '大唐不夜城':'火树银花'
  };

  // 编辑模式切换
  function toggleEditMode(){
    editMode=!editMode;
    var markers=mapTransform.querySelectorAll('.map-marker');
    
    if(editMode){
      // 进入编辑模式
      editPanel.classList.add('active');
      editModeHint.classList.add('hidden');
      markers.forEach(function(m){
        m.classList.add('editing');
      });
      // 禁用地图拖拽
      mapTransform.style.cursor='default';
      // 关闭卷轴卡片
      closeScrollCard();
    }else{
      // 退出编辑模式
      editPanel.classList.remove('active');
      editModeHint.classList.remove('hidden');
      markers.forEach(function(m){
        m.classList.remove('editing');
      });
      mapTransform.style.cursor='grab';
    }
  }

  // 监听E键切换编辑模式
  document.addEventListener('keydown',function(e){
    if(e.key==='e'||e.key==='E'){
      toggleEditMode();
    }
  });

  // 保存按钮点击
  var saveBtn=document.getElementById('editSaveBtn');
  if(saveBtn){
    saveBtn.addEventListener('click',function(){
      savePositions();
      // 显示保存成功提示
      saveBtn.textContent='✓ 已保存';
      setTimeout(function(){
        saveBtn.textContent='💾 保存坐标';
      },1500);
    });
  }

  // Marker click
  var markers=mapTransform.querySelectorAll('.map-marker');
  markers.forEach(function(marker){
    // 编辑模式下地标拖拽开始
    marker.addEventListener('mousedown',function(e){
      if(!editMode)return;
      e.stopPropagation();
      editingMarker=marker;
      markerStartX=e.clientX;
      markerStartY=e.clientY;
      markerStartLeft=parseFloat(marker.style.left);
      markerStartTop=parseFloat(marker.style.top);
      if(isNaN(markerStartLeft))markerStartLeft=50;
      if(isNaN(markerStartTop))markerStartTop=50;
    });
    
    // 正常模式点击显示卷轴卡片
    marker.addEventListener('click',function(e){
      if(editMode||isFocusing)return;
      e.stopPropagation();
      var name=marker.getAttribute('data-name')||'';
      var type=marker.getAttribute('data-type')||'';
      var desc=marker.getAttribute('data-desc')||'';
      var detail=marker.getAttribute('data-link')||'';
      exploreLandmark(marker,name,type,desc,detail);
    });
  });

  // 探索地标 - 地图聚焦 + 卷轴弹出
  function exploreLandmark(marker,name,type,desc,detail){
    // 关闭之前的卡片
    closeScrollCard();
    
    isFocusing=true;
    currentDetailLink=detail;
    
    // 获取地标在视口中的位置
    var markerRect=marker.getBoundingClientRect();
    var mapRect=mapPage.getBoundingClientRect();
    var mapCenterX=mapRect.width/2;
    var mapCenterY=mapRect.height/2;
    
    // 计算需要移动的距离
    var targetScale=1.2;
    var dx=(markerRect.left+markerRect.width/2)-mapCenterX;
    var dy=(markerRect.top+markerRect.height/2)-mapCenterY;
    
    // 计算新的pan值
    var targetPanX=panX-dx*(targetScale-1);
    var targetPanY=panY-dy*(targetScale-1);
    
    // 执行平滑动画
    var startScale=scale;
    var startPanX=panX;
    var startPanY=panY;
    var duration=1000;
    var startTime=performance.now();
    
    function animate(currentTime){
      var elapsed=currentTime-startTime;
      var progress=Math.min(elapsed/duration,1);
      
      // ease-in-out 缓动
      progress=1-Math.pow(1-progress,3);
      
      scale=startScale+(targetScale-startScale)*progress;
      panX=startPanX+(targetPanX-startPanX)*progress;
      panY=startPanY+(targetPanY-startPanY)*progress;
      
      applyTransform();
      
      if(progress<1){
        requestAnimationFrame(animate);
      }else{
        // 动画完成
        isFocusing=false;
        showScrollCard(marker,name,type,desc);
      }
    }
    
    requestAnimationFrame(animate);
  }

  // 显示卷轴卡片
  function showScrollCard(marker,name,type,desc){
    // 激活地标
    markers.forEach(function(m){m.classList.remove('active');});
    marker.classList.add('active');
    
    // 显示遮罩
    mapOverlay.classList.add('active');
    
    // 更新卷轴内容
    scrollTitle.textContent=name;
    scrollEra.textContent=eraMap[name]||type;
    scrollTag.textContent=tagMap[name]||type;
    scrollDesc.textContent=desc.length>60?desc.substring(0,60)+'...':desc;
    
    // 计算卡片位置
    var markerRect=marker.getBoundingClientRect();
    var mapRect=mapPage.getBoundingClientRect();
    var cardWidth=300;
    var cardHeight=280;
    
    var cardX,cardY;
    var markerCenterX=markerRect.left+markerRect.width/2;
    var markerCenterY=markerRect.top+markerRect.height/2;
    
    // 根据地标位置决定卡片位置
    var mapCenterX=mapRect.left+mapRect.width/2;
    
    if(markerCenterX<mapCenterX-50){
      // 左侧地标 - 卡片显示在右侧
      cardX=markerRect.right+20;
      cardY=markerCenterY-cardHeight/2;
    }else if(markerCenterX>mapCenterX+50){
      // 右侧地标 - 卡片显示在左侧
      cardX=markerRect.left-cardWidth-20;
      cardY=markerCenterY-cardHeight/2;
    }else{
      // 中间地标 - 卡片显示在上方
      cardX=markerCenterX-cardWidth/2;
      cardY=markerRect.top-cardHeight-30;
    }
    
    // 确保不超出屏幕
    cardX=Math.max(20,Math.min(cardX,window.innerWidth-cardWidth-20));
    cardY=Math.max(100,Math.min(cardY,window.innerHeight-cardHeight-100));
    
    // 设置卡片位置
    scrollCard.style.left=cardX+'px';
    scrollCard.style.top=cardY+'px';
    
    // 显示卡片
    scrollCard.classList.remove('active');
    setTimeout(function(){
      scrollCard.classList.add('active');
    },30);
  }

  // 关闭卷轴卡片
  function closeScrollCard(){
    scrollCard.classList.remove('active');
    mapOverlay.classList.remove('active');
    markers.forEach(function(m){m.classList.remove('active');});
    currentDetailLink='';
    
    // 恢复地图原始缩放
    if(scale!==1||panX!==0||panY!==0){
      var startScale=scale;
      var startPanX=panX;
      var startPanY=panY;
      var duration=800;
      var startTime=performance.now();
      
      function animate(currentTime){
        var elapsed=currentTime-startTime;
        var progress=Math.min(elapsed/duration,1);
        progress=1-Math.pow(1-progress,3);
        
        scale=startScale+(1-startScale)*progress;
        panX=startPanX+(0-startPanX)*progress;
        panY=startPanY+(0-startPanY)*progress;
        
        applyTransform();
        
        if(progress<1){
          requestAnimationFrame(animate);
        }
      }
      
      requestAnimationFrame(animate);
    }
  }

  // 进入志卷按钮点击
  scrollAction.onclick=function(){
    if(currentDetailLink){
      var t=document.querySelector('.page-transition');
      if(t){
        t.classList.add('active');
        setTimeout(function(){window.location.href=currentDetailLink;},400);
      }else{
        window.location.href=currentDetailLink;
      }
    }
  };

  // 关闭按钮点击
  scrollClose.onclick=closeScrollCard;

  // Close on click outside
  mapPage.addEventListener('click',function(e){
    if(!e.target.closest('.map-marker')&&!e.target.closest('.map-scroll-card')){
      closeScrollCard();
    }
  });

  // Close on ESC
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){
      closeScrollCard();
    }
  });
}

})();
