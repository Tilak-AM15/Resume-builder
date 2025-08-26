
    // helper
    const $ = s => document.querySelector(s);
    const $$ = s => Array.from(document.querySelectorAll(s));

    // state
    const state = {
      name:'', email:'', phone:'', role:'', summary:'',
      skills: [], edu: [], exp: [], projects: [], certs: [], links: [],
      photoDataUrl:'', template:'modern'
    };

    // refs
    const pName = $('#pName'), pTop = $('#pTop'), pSummary = $('#pSummary');
    const pSkills = $('#pSkills'), pEdu = $('#pEdu'), pExp = $('#pExp'), pProjects = $('#pProjects'), pCerts = $('#pCerts'), pLinks = $('#pLinks');
    const completionText = $('#completionText'), bar = $('#progress-bar'), resumePreview = $('#resumePreview'), generatedDateEl = $('#generatedDate');

    // quick skills
    const SKILLS = ['JavaScript','TypeScript','HTML','CSS','React','Node.js','Express','MongoDB','Python','Django','Flask','Git','Tailwind','SQL','Java','C++'];
    const skillsChecks = $('#skillsChecks');

    function renderSkillCheckboxes(){
      skillsChecks.innerHTML = '';
      const container = document.createElement('div');
      container.style.display='grid';
      container.style.gridTemplateColumns='repeat(2, minmax(0,1fr))';
      container.style.gap='8px';
      SKILLS.forEach(sk=>{
        const id = 'sk_' + sk.replace(/[^a-z0-9]/gi,'');
        const wrap = document.createElement('label');
        wrap.style.display='flex';wrap.style.alignItems='center';wrap.style.gap='8px';wrap.style.cursor='pointer';
        const cb = document.createElement('input');
        cb.type='checkbox';cb.id=id;cb.checked = state.skills.includes(sk);
        cb.addEventListener('change', e=>{
          if(e.target.checked){ if(!state.skills.includes(sk)) state.skills.push(sk) } else { state.skills = state.skills.filter(x=>x!==sk) }
          renderSkills(); updateProgress(); saveToStorage();
        });
        const sp = document.createElement('span'); sp.textContent = sk; sp.className='muted';
        wrap.appendChild(cb); wrap.appendChild(sp); container.appendChild(wrap);
      });
      skillsChecks.appendChild(container);
    }

    function renderSkills(){
      $('#skillChips').innerHTML = '';
      state.skills.forEach(sk=>{
        const el = document.createElement('span'); el.className='chip'; el.textContent = sk;
        el.title = 'Click to remove';
        el.addEventListener('click', ()=> { state.skills = state.skills.filter(x=>x!==sk); renderSkillCheckboxes(); renderSkills(); updateProgress(); saveToStorage(); });
        $('#skillChips').appendChild(el);
      });
      pSkills.innerHTML = '';
      state.skills.forEach(sk=>{
        const el = document.createElement('span'); el.className='chip'; el.textContent = sk; pSkills.appendChild(el);
      });
    }

    $('#addSkill').addEventListener('click', ()=>{
      const val = $('#skillInput').value.trim(); if(!val) return;
      if(!state.skills.includes(val)) state.skills.push(val);
      $('#skillInput').value=''; renderSkillCheckboxes(); renderSkills(); updateProgress(); saveToStorage();
    });

    // links
    const linksList = $('#linksList');
    function renderLinks(){
      linksList.innerHTML=''; pLinks.innerHTML='';
      state.links.forEach(({label,url}, idx)=>{
        const item = document.createElement('div'); item.className='item';
        item.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center">
                            <div><b>${label||'Link'}</b><div class="muted" style="font-size:.85rem">${url||''}</div></div>
                            <div style="display:flex;gap:6px"><button type="button" data-idx="${idx}" class="link-edit small">Edit</button><button type="button" data-idx="${idx}" class="link-del small">Remove</button></div>
                          </div>`;
        linksList.appendChild(item);
        // preview link
        const a = document.createElement('a'); a.href = url || '#'; a.textContent = label; a.target='_blank'; a.style.marginRight='10px'; a.style.color='var(--accent)'; pLinks.appendChild(a);
      });
      // attach listeners
      $$('.link-del').forEach(btn=>{
        btn.addEventListener('click', e=>{
          const i = +e.target.dataset.idx; state.links.splice(i,1); renderLinks(); saveToStorage(); updateProgress();
        });
      });
      $$('.link-edit').forEach(btn=>{
        btn.addEventListener('click', e=>{
          const i = +e.target.dataset.idx; const obj = state.links[i];
          $('#linkLabel').value = obj.label; $('#linkUrl').value = obj.url;
          // remove existing one to be replaced on add
          state.links.splice(i,1); renderLinks(); saveToStorage();
        });
      });
    }
    $('#addLink').addEventListener('click', ()=>{
      const label = $('#linkLabel').value.trim(); const url = $('#linkUrl').value.trim();
      if(!label || !url) { alert('Please provide label and URL'); return; }
      state.links.push({label,url}); $('#linkLabel').value=''; $('#linkUrl').value=''; renderLinks(); saveToStorage(); updateProgress();
    });

    // bind top fields
    const bindings = [['#name','name'],['#email','email'],['#phone','phone'],['#role','role'],['#summary','summary']];
    bindings.forEach(([sel,key])=>{
      $(sel).addEventListener('input', e=>{ state[key] = e.target.value; paintHeader(); paintSummary(); updateProgress(); saveToStorage(); });
    });
    function paintHeader(){
      pName.textContent = state.name || 'Your Name';
      const email = state.email || 'email@example.com';
      const phone = state.phone || '+91 00000 00000';
      const role = state.role || 'Role';
      pTop.textContent = `${email} • ${phone} • ${role}`;
    }
    function paintSummary(){ pSummary.textContent = state.summary || 'Write a short professional summary. It updates as you type.'; }

    // Education & Experience
    const eduList = $('#eduList'), expList = $('#expList');
    function addEdu(initial = {}){ const node = document.importNode($('#tplEdu').content, true); const wrapper = node.querySelector('.item');
      const item = { degree:'', school:'', college:'', studyYear:'', duration:'', cgpa:'', ...initial }; state.edu.push(item);
      wrapper.querySelectorAll('input').forEach(inp=>{ const key = inp.dataset.key; inp.value = item[key] || ''; inp.addEventListener('input', e=>{ item[key] = e.target.value; renderEdu(); updateProgress(); saveToStorage(); }); });
      wrapper.querySelector('.del').addEventListener('click', ()=>{ const i = Array.from(eduList.children).indexOf(wrapper); state.edu.splice(i,1); wrapper.remove(); renderEdu(); updateProgress(); saveToStorage(); });
      eduList.appendChild(wrapper); renderEdu(); updateProgress(); enableSortables();
    }
    function renderEdu(){ pEdu.innerHTML=''; state.edu.forEach(({degree, school, college, studyYear, duration, cgpa})=>{ const el = document.createElement('div'); el.className='entry';
      el.innerHTML = `<div class="headline"><b>${degree || 'Degree / Program'}</b><span class="sub">${studyYear || ''}</span></div>
                      <div class="sub" style="margin-top:4px">${school||''} ${college? '• ' + college : ''}</div>
                      <div style="margin-top:6px">${duration || ''}</div>
                      ${cgpa ? `<div class="desc">Score: ${cgpa}</div>` : ''}`; pEdu.appendChild(el);
    }); }

    function addExp(initial = {}){ const node = document.importNode($('#tplExp').content, true); const wrapper = node.querySelector('.item');
      const item = { title:'', company:'', duration:'', desc:'', ...initial }; state.exp.push(item);
      wrapper.querySelectorAll('input').forEach(inp=>{ const key = inp.dataset.key; inp.value = item[key] || ''; inp.addEventListener('input', e=>{ item[key] = e.target.value; renderExp(); updateProgress(); saveToStorage(); }); });
      wrapper.querySelector('.del').addEventListener('click', ()=>{ const i = Array.from(expList.children).indexOf(wrapper); state.exp.splice(i,1); wrapper.remove(); renderExp(); updateProgress(); saveToStorage(); });
      expList.appendChild(wrapper); renderExp(); updateProgress(); enableSortables();
    }
    function renderExp(){ pExp.innerHTML=''; state.exp.forEach(({title, company, duration, desc})=>{ const el = document.createElement('div'); el.className='entry';
      el.innerHTML = `<div class="headline"><b>${title || 'Role'}</b><span class="sub">${duration || ''}</span></div>
                      <div class="sub" style="margin-top:4px">${company || ''}</div>
                      ${desc ? `<div class="desc">${desc}</div>` : ''}`; pExp.appendChild(el);
    }); }

    $('#addEdu').addEventListener('click', ()=>addEdu());
    $('#addExp').addEventListener('click', ()=>addExp());

    // Projects
    const projList = $('#projList');
    function addProject(initial = {}){ const node = document.importNode($('#tplProject').content, true); const wrapper = node.querySelector('.item');
      const item = { title:'', desc:'', url:'', meta:'', ...initial }; state.projects.push(item);
      wrapper.querySelectorAll('input').forEach(inp=>{ const key = inp.dataset.key; inp.value = item[key] || ''; inp.addEventListener('input', e=>{ item[key] = e.target.value; renderProjects(); updateProgress(); saveToStorage(); }); });
      wrapper.querySelector('.del').addEventListener('click', ()=>{ const i = Array.from(projList.children).indexOf(wrapper); state.projects.splice(i,1); wrapper.remove(); renderProjects(); updateProgress(); saveToStorage(); });
      projList.appendChild(wrapper); renderProjects(); updateProgress(); enableSortables();
    }
    function renderProjects(){ pProjects.innerHTML=''; state.projects.forEach(({title, desc, url, meta})=>{ const el = document.createElement('div'); el.className='entry';
      el.innerHTML = `<div class="headline"><b>${title || 'Project'}</b><span class="small-meta">${meta || ''}</span></div>
                      <div class="sub" style="margin-top:4px">${desc || ''}</div>
                      ${url ? `<div style="margin-top:6px"><a href="${url}" target="_blank" rel="noopener" style="color:var(--accent)">${url}</a></div>` : ''}`;
      pProjects.appendChild(el);
    }); }
    $('#addProject').addEventListener('click', ()=>addProject());

    // Certifications
    const certList = $('#certList');
    function addCert(initial = {}){ const node = document.importNode($('#tplCert').content, true); const wrapper = node.querySelector('.item');
      const item = { title:'', issuer:'', year:'', ...initial }; state.certs.push(item);
      wrapper.querySelectorAll('input').forEach(inp=>{ const key = inp.dataset.key; inp.value = item[key] || ''; inp.addEventListener('input', e=>{ item[key] = e.target.value; renderCerts(); updateProgress(); saveToStorage(); }); });
      wrapper.querySelector('.del').addEventListener('click', ()=>{ const i = Array.from(certList.children).indexOf(wrapper); state.certs.splice(i,1); wrapper.remove(); renderCerts(); updateProgress(); saveToStorage(); });
      certList.appendChild(wrapper); renderCerts(); updateProgress(); enableSortables();
    }
    function renderCerts(){ pCerts.innerHTML=''; state.certs.forEach(({title, issuer, year})=>{ const el = document.createElement('div'); el.className='entry';
      el.innerHTML = `<div class="headline"><b>${title || 'Certification'}</b><span class="small-meta">${year || ''}</span></div>
                      <div class="sub" style="margin-top:4px">${issuer || ''}</div>`; pCerts.appendChild(el);
    }); }
    $('#addCert').addEventListener('click', ()=>addCert());

    // Sortable for edu/exp/proj/certs lists
    let eduSorter, expSorter, projSorter, certSorter;
    function enableSortables(){
      if(eduSorter) eduSorter.destroy(); if(expSorter) expSorter.destroy(); if(projSorter) projSorter.destroy(); if(certSorter) certSorter.destroy();
      eduSorter = new Sortable(eduList, { animation:150, onEnd:(evt)=>{ const from=evt.oldIndex,to=evt.newIndex;if(from===to) return; const moved=state.edu.splice(from,1)[0]; state.edu.splice(to,0,moved); renderEdu(); saveToStorage(); }});
      expSorter = new Sortable(expList, { animation:150, onEnd:(evt)=>{ const from=evt.oldIndex,to=evt.newIndex;if(from===to) return; const moved=state.exp.splice(from,1)[0]; state.exp.splice(to,0,moved); renderExp(); saveToStorage(); }});
      projSorter = new Sortable(projList, { animation:150, onEnd:(evt)=>{ const from=evt.oldIndex,to=evt.newIndex;if(from===to) return; const moved=state.projects.splice(from,1)[0]; state.projects.splice(to,0,moved); renderProjects(); saveToStorage(); }});
      certSorter = new Sortable(certList, { animation:150, onEnd:(evt)=>{ const from=evt.oldIndex,to=evt.newIndex;if(from===to) return; const moved=state.certs.splice(from,1)[0]; state.certs.splice(to,0,moved); renderCerts(); saveToStorage(); }});
    }

    // Photo handling
    const photoInput = $('#photoInput');
    photoInput.addEventListener('change', e=>{
      const f = e.target.files && e.target.files[0]; if(!f) return;
      if(f.size > 2_500_000){ if(!confirm('Image >2.5MB. Continue?')) return; }
      const reader = new FileReader();
      reader.onload = ev => { state.photoDataUrl = ev.target.result; updatePhoto(); saveToStorage(); updateProgress(); };
      reader.readAsDataURL(f); photoInput.value = '';
    });

    function updatePhoto(){
      if(state.photoDataUrl){
        $('#photoPreview').innerHTML = ''; const img = document.createElement('img'); img.src = state.photoDataUrl; img.style.width='100%'; img.style.height='100%'; img.style.objectFit='cover'; $('#photoPreview').appendChild(img);
        $('#pPhotoPreview').innerHTML = ''; const img2 = document.createElement('img'); img2.src = state.photoDataUrl; img2.style.width='100%'; img2.style.height='100%'; img2.style.objectFit='cover'; $('#pPhotoPreview').appendChild(img2);
        // allow click to remove
        $('#photoPreview').onclick = ()=>{ if(confirm('Remove photo?')){ state.photoDataUrl=''; updatePhoto(); saveToStorage(); updateProgress(); } };
      } else {
        $('#photoPreview').innerHTML = '<span class="muted">No photo</span>';
        $('#pPhotoPreview').innerHTML = '<div id="pPhotoPlaceholder" class="muted">Photo</div>';
      }
    }

    // Template handling
    const tplBtns = $$('.tpl-btn');
    function setTemplate(tpl){
      state.template = tpl;
      resumePreview.classList.remove('tpl-modern','tpl-minimal','tpl-classic','tpl-professional','tpl-creative');
      resumePreview.classList.add('tpl-'+tpl);
      tplBtns.forEach(b=> b.classList.toggle('active', b.dataset.tpl===tpl));
      updateProgress(); saveToStorage();
    }
    tplBtns.forEach(b=> b.addEventListener('click', ()=> setTemplate(b.dataset.tpl)));

    // Progress calculation (include projects/certs/links)
    function computeCompletion(){
      let total = 12; let score = 0;
      if(state.name) score++; if(state.email) score++; if(state.phone) score++; if(state.role) score++; if(state.summary) score++;
      if(state.skills.length>0) score++;
      score += Math.min(2, state.edu.length); total += 2;
      score += Math.min(2, state.exp.length); total += 2;
      if(state.projects.length>0) score++;
      if(state.certs.length>0) score++;
      if(state.links.length>0) score++;
      if(state.photoDataUrl) score++; total++;
      if(state.template) score++; total++;
      const pct = Math.round((score/total)*100);
      return Math.max(0, Math.min(100,pct));
    }
    function updateProgress(){ const pct = computeCompletion(); bar.style.width = pct + '%'; completionText.textContent = pct + '% complete'; }

    // Save/load
    const STORAGE_KEY = 'resume_builder_ext_v1';
    function saveToStorage(){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){ console.warn(e); } }
    function loadFromStorage(){ try{ const raw = localStorage.getItem(STORAGE_KEY); if(!raw) return false; const parsed = JSON.parse(raw); Object.assign(state, parsed); return true; }catch(e){ console.warn(e); return false; } }
    function clearAll(){ if(!confirm('Clear all inputs and saved data?')) return; localStorage.removeItem(STORAGE_KEY);
      state.name=state.email=state.phone=state.role=state.summary=''; state.skills=[]; state.edu=[]; state.exp=[]; state.projects=[]; state.certs=[]; state.links=[]; state.photoDataUrl=''; state.template='modern';
      $('#resumeForm').reset(); eduList.innerHTML=''; expList.innerHTML=''; projList.innerHTML=''; certList.innerHTML=''; linksList.innerHTML='';
      renderSkillCheckboxes(); renderSkills(); paintHeader(); paintSummary(); renderEdu(); renderExp(); renderProjects(); renderCerts(); renderLinks(); updatePhoto(); setTemplate('modern'); updateProgress(); alert('Cleared');
    }
    $('#btnClear').addEventListener('click', clearAll);
    $('#btnSave').addEventListener('click', ()=>{ saveToStorage(); alert('Saved to localStorage'); });

    // load sample
    $('#btnLoadSample').addEventListener('click', ()=>{
      state.name = 'Tilak Abbigerimath';
      state.email = 'tilak@example.com'; state.phone = '+91 98765 43210'; state.role = 'Frontend Developer';
      state.summary = 'Passionate frontend engineer building accessible, high-performance web interfaces.';
      state.skills = ['JavaScript','React','HTML','CSS','Tailwind'];
      state.edu = [{degree:'B.E. Computer Science', school:'VTU', college:'BDT College of Engineering', studyYear:'2019-2023', duration:'2019 – 2023', cgpa:'8.5'}];
      state.exp = [{title:'Frontend Intern', company:'Acme Corp', duration:'Jan 2024 – Jun 2024', desc:'Built responsive UI components and improved performance.'}];
      state.projects = [{title:'Interactive Resume', desc:'A client-side resume builder with templates and PDF export', url:'https://example.com', meta:'React • HTML • JS'}];
      state.certs = [{title:'Web Dev Bootcamp', issuer:'Coursera', year:'2023'}];
      state.links = [{label:'GitHub', url:'https://github.com/tilak'}, {label:'LinkedIn', url:'https://linkedin.com/in/tilak'}];
      state.photoDataUrl = ''; setTemplate('professional');
      renderSkillCheckboxes(); renderSkills(); paintHeader(); paintSummary(); renderEdu(); renderExp(); renderProjects(); renderCerts(); renderLinks(); updatePhoto(); updateProgress(); saveToStorage();
    });

    // Export PDF
    $('#btnExport').addEventListener('click', ()=>{
      generatedDateEl.textContent = new Date().toLocaleDateString();
      const opt = {
        margin:0.35, filename:(state.name?state.name.replace(/\s+/g,'_'):'resume') + '.pdf',
        image:{type:'jpeg',quality:0.97}, html2canvas:{scale:2,useCORS:true,logging:false}, jsPDF:{unit:'in',format:'a4',orientation:'portrait'}
      };
      const clone = resumePreview.cloneNode(true);
      clone.style.width = '210mm'; clone.style.boxSizing='border-box'; clone.style.padding='18px';
      // inline images
      clone.querySelectorAll('img').forEach(img=>{
        const id = img.id;
        const real = document.getElementById(id);
        if(real && real.src) img.src = real.src;
      });
      html2pdf().set(opt).from(clone).save();
    });

    // Print fallback
    $('#btnDownload').addEventListener('click', ()=>{ generatedDateEl.textContent = new Date().toLocaleDateString(); window.print(); });

    // hydrate UI from storage
    function hydrateUI(){
      loadFromStorage();
      $('#name').value = state.name || ''; $('#email').value = state.email || ''; $('#phone').value = state.phone || '';
      $('#role').value = state.role || ''; $('#summary').value = state.summary || '';
      renderSkillCheckboxes(); renderSkills();
      // build DOM lists from state
      eduList.innerHTML=''; expList.innerHTML=''; projList.innerHTML=''; certList.innerHTML=''; linksList.innerHTML='';
      state.edu.forEach(e=> addEdu(e)); state.exp.forEach(e=> addExp(e)); state.projects.forEach(p=> addProject(p)); state.certs.forEach(c=> addCert(c));
      renderLinks(); updatePhoto(); setTemplate(state.template||'modern'); paintHeader(); paintSummary(); updateProgress(); enableSortables();
    }

    // render functions re-used earlier for projects/certs/edu/exp/links etc.
    function renderProjects(){ pProjects.innerHTML=''; state.projects.forEach(({title,desc,url,meta})=>{ const el=document.createElement('div'); el.className='entry'; el.innerHTML=`<div class="headline"><b>${title||'Project'}</b><span class="small-meta">${meta||''}</span></div><div class="sub" style="margin-top:4px">${desc||''}</div>${url?`<div style="margin-top:6px"><a href="${url}" target="_blank" rel="noopener" style="color:var(--accent)">${url}</a></div>`:''}`; pProjects.appendChild(el); }); }
    function renderCerts(){ pCerts.innerHTML=''; state.certs.forEach(({title,issuer,year})=>{ const el=document.createElement('div'); el.className='entry'; el.innerHTML=`<div class="headline"><b>${title||'Certification'}</b><span class="small-meta">${year||''}</span></div><div class="sub" style="margin-top:4px">${issuer||''}</div>`; pCerts.appendChild(el); }); }
    function renderLinks(){ linksList.innerHTML=''; pLinks.innerHTML=''; state.links.forEach(({label,url}, idx)=>{ const item=document.createElement('div'); item.className='item'; item.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center"><div><b>${label||'Link'}</b><div class="muted" style="font-size:.85rem">${url||''}</div></div><div style="display:flex;gap:6px"><button type="button" data-idx="${idx}" class="link-edit small">Edit</button><button type="button" data-idx="${idx}" class="link-del small">Remove</button></div></div>`; linksList.appendChild(item); const a=document.createElement('a'); a.href=url||'#'; a.textContent=label; a.target='_blank'; a.style.marginRight='10px'; a.style.color='var(--accent)'; pLinks.appendChild(a); }); // listeners
      $$('.link-del').forEach(btn=>btn.addEventListener('click',e=>{ const i=+e.target.dataset.idx; state.links.splice(i,1); renderLinks(); saveToStorage(); updateProgress(); }));
      $$('.link-edit').forEach(btn=>btn.addEventListener('click',e=>{ const i=+e.target.dataset.idx; const obj=state.links[i]; $('#linkLabel').value = obj.label; $('#linkUrl').value = obj.url; state.links.splice(i,1); renderLinks(); saveToStorage(); }));
    }

    // initial render utilities to keep single-source functions defined above in right order
    // (edu/exp add/render already defined earlier)
    // computeCompletion, updateProgress defined earlier too

    // ensure periodic progress update
    setInterval(()=>updateProgress(),1200);

    // initialize
    hydrateUI();

    // small UI: addEdu/addExp/addProject/addCert are already wired to push to state and add DOM
    // add missing event listeners for addProject/addCert already set above

    // extra: pressing Enter in link inputs triggers add
    $('#linkUrl').addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); $('#addLink').click(); } });

    // small guard before unload: save automatically
    window.addEventListener('beforeunload', ()=>{ saveToStorage(); });

    // ready
    generatedDateEl.textContent = new Date().toLocaleDateString();
