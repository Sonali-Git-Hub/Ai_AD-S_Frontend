const fs = require('fs');
let content = fs.readFileSync('src/Components/AiSocialMediaDashboard.jsx', 'utf8');

const startMarker = 'const renderComingSoon = (tabId) => {';
const endMarker = 'const renderHashtagStudio = () => {';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const cleanSection = \const renderComingSoon = (tabId) => {
    return (
      <div className=\"flex flex-col items-center justify-center h-full text-center opacity-40 animate-in fade-in duration-1000\">
        <div className=\"w-24 h-24 rounded-[32px] bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-8 border border-white/5\">
          <Layers className=\"w-12 h-12 text-slate-400\" />
        </div>
        <h2 className=\"text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-4\">Module: {tabId.toUpperCase()}</h2>
        <p className=\"text-slate-500 dark:text-slate-400 font-medium text-sm max-w-sm\">
          This advanced capability is currently being calibrated in Phase 2 development. Check back soon for full integration.
        </p>
        <button onClick={() => setActiveTab('overview')} className=\"mt-12 text-xs font-black text-primary uppercase tracking-[4px] border-b-2 border-primary pb-1\">Return to Overview</button>
      </div>
    );
  };

  const renderContentOrchestration = () => {
    const guard = renderModuleGuard(\"Content Generation\");
    if (guard) return guard;
    const finalRows = (pipelineRows?.length || 0) > 0 ? pipelineRows : calendarEntries;

    return (
      <div className=\"animate-in fade-in slide-in-from-bottom-4 duration-700 h-auto flex flex-col space-y-6 pb-32\">
        {/* Step 1: Strategy Context Selector */}
        <div className=\"bg-white dark:bg-[#080808] p-6 lg:p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-xl\">
          <div className=\"flex flex-col md:flex-row md:items-center justify-between gap-8\">
            <div className=\"max-w-md w-full\">
              <label className=\"text-[10px] font-black text-slate-400 uppercase tracking-[3px] block mb-4\">Select Target Brand Strategy</label>
              <CustomSelect 
                value={workspace?._id}
                onChange={(val) => {
                  const ws = calendarWorkspaces.find(b => b._id === val);
                  if (ws) {
                    switchWorkspace(ws);
                    fetchPipelines(ws._id);
                  }
                }}
                options={calendarWorkspaces.length === 0 ? [{ value: '', label: 'Discovery: No Strategy Maps Found' }] : calendarWorkspaces.map(b => ({
                  value: b._id,
                  label: b.workspaceName || b.brandProfile?.companyName || \"Untitled Brand\"
                }))}
                className=\"h-16 pl-6 pr-12 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl text-xs\"
                color=\"primary\"
              />
            </div>

            {workspace && (
              <div className=\"flex items-center gap-6 p-4 bg-slate-50 dark:bg-white/5 rounded-[32px] border border-slate-100 dark:border-white/5\">
                <div className=\"w-16 h-16 rounded-2xl overflow-hidden bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 flex items-center justify-center p-2\">
                  {(activeProfile?.logoUrl || workspace?.brandProfile?.logoUrl || workspace?.onboarding?.profileImageUrl) ? (
                    <img 
                      src={toProxyUrl(activeProfile?.logoUrl || workspace?.brandProfile?.logoUrl || workspace?.onboarding?.profileImageUrl)} 
                      className=\"w-full h-full object-contain\" 
                      alt=\"Logo\" 
                    />
                  ) : (
                    <div className=\"w-full h-full bg-primary text-white flex items-center justify-center text-xl font-black\">
                      {(activeProfile?.companyName || workspace?.workspaceName || 'B').charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className=\"text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none mb-1\">{workspace.workspaceName}</h3>
                  <div className=\"flex items-center gap-2\">
                    <div className=\"w-2 h-2 rounded-full bg-emerald-500 animate-pulse\" />
                    <p className=\"text-[9px] font-black text-slate-400 uppercase tracking-widest\">Active Brand Ecosystem</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Integrated Brand Dashboard Summary */}
        {workspace && (
          <div className=\"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150\">
            <div className=\"bg-white dark:bg-[#080808] p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-xl flex flex-col justify-between\">
              <div>
                <div className=\"flex justify-between items-start mb-4\">
                  <div className=\"p-3 rounded-2xl bg-indigo-500/10 text-indigo-500\">
                    <Target className=\"w-5 h-5\" />
                  </div>
                  <span className=\"text-[10px] font-black text-slate-400 uppercase tracking-widest\">Core Narrative</span>
                </div>
                <h4 className=\"text-sm font-black text-slate-800 dark:text-white uppercase mb-2\">Content Objective</h4>
                <p className=\"text-xs text-slate-500 font-medium leading-relaxed italic line-clamp-2\">
                  {brandProfile?.contentObjective || workspace?.currentStrategy?.summary || \"Define your brand narrative in Settings to unlock deep strategy.\"}
                </p>
              </div>
            </div>

            <div className=\"bg-white dark:bg-[#080808] p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-xl flex flex-col justify-between\">
              <div>
                <div className=\"flex justify-between items-start mb-4\">
                  <div className=\"p-3 rounded-2xl bg-emerald-500/10 text-emerald-500\">
                    <Activity className=\"w-5 h-5\" />
                  </div>
                  <span className=\"text-[10px] font-black text-slate-400 uppercase tracking-widest\">Active Channels</span>
                </div>
                <h4 className=\"text-sm font-black text-slate-800 dark:text-white uppercase mb-2\">Platform Mix</h4>
                <div className=\"flex gap-2 mt-3\">
                  {['Instagram', 'LinkedIn', 'Twitter', 'Facebook'].map(p => {
                    const isActive = workspace?.currentStrategy?.platform_plan?.some(pp => pp.platform === p);
                    return (
                      <div key={p} className={\w-8 h-8 rounded-full flex items-center justify-center border \\}>
                        {p === 'Instagram' && <Instagram className=\"w-3.5 h-3.5\" />}
                        {p === 'LinkedIn' && <Linkedin className=\"w-3.5 h-3.5\" />}
                        {p === 'Twitter' && <Twitter className=\"w-3.5 h-3.5\" />}
                        {p === 'Facebook' && <Facebook className=\"w-3.5 h-3.5\" />}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className=\"bg-white dark:bg-[#080808] p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-xl flex flex-col justify-between\">
              <div>
                <div className=\"flex justify-between items-start mb-4\">
                  <div className=\"p-3 rounded-2xl bg-amber-500/10 text-amber-500\">
                    <History className=\"w-5 h-5\" />
                  </div>
                  <span className=\"text-[10px] font-black text-slate-400 uppercase tracking-widest\">Strategy Themes</span>
                </div>
                <h4 className=\"text-sm font-black text-slate-800 dark:text-white uppercase mb-2\">Weekly Topics</h4>
                <div className=\"flex flex-wrap gap-2 mt-2\">
                  {(workspace?.currentStrategy?.weekly_themes || []).slice(0, 3).map((theme, i) => (
                    <span key={i} className=\"text-[8px] font-black bg-slate-100 dark:bg-white/5 text-slate-500 px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10\">
                      {typeof theme === 'object' ? (theme.theme || theme.content_focus || \Week \\) : theme}
                    </span>
                  ))}
                  {(!workspace?.currentStrategy?.weekly_themes || workspace.currentStrategy.weekly_themes.length === 0) && (
                    <span className=\"text-[9px] font-bold text-slate-400 italic\">No themes mapped yet.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Content Generation Pipeline */}
        {isPipelineLoading ? (
          <div className=\"flex flex-col items-center justify-center p-32 bg-white dark:bg-[#080808]/50 rounded-[40px] border border-slate-100 dark:border-white/5 space-y-6\">
            <div className=\"w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin\" />
            <p className=\"text-[10px] font-black text-slate-400 uppercase tracking-[4px] animate-pulse\">Establishing Secure Brand Connection...</p>
          </div>
        ) : finalRows.length > 0 ? (
          <div className=\"bg-white dark:bg-[#080808]/50 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-xl animate-in slide-in-from-bottom-8 duration-700 min-h-[400px] sm:min-h-[500px] flex flex-col\">
            <div className=\"p-6 sm:p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0\">
              <div className=\"flex items-center gap-4 self-start\">
                <div className=\"w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20\">
                  <Server className=\"w-5 h-5 sm:w-6 sm:h-6\" />
                </div>
                <div>
                  <h3 className=\"text-xs sm:text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest\">Orchestration Pipeline: {workspace?.workspaceName}</h3>
                  <p className=\"text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase mt-1\">{finalRows.length} Strategized Rows Detected</p>
                </div>
              </div>
              <div className=\"flex items-center gap-4 w-full sm:w-auto\">
                <div className=\"relative group w-full sm:w-auto\">
                  <button 
                    onClick={() => handleGenerateContent('selected', finalRows.length, finalRows.map(r => r._id))}
                    disabled={isGenerating}
                    className=\"h-12 w-full sm:w-auto px-8 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center sm:justify-start gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 relative z-10 overflow-hidden\"
                  >
                    <div className=\"absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000\" />
                    {isGenerating ? <RefreshCw className=\"w-4 h-4 animate-spin\" /> : <Zap className=\"w-4 h-4\" />} 
                    Generate Full Plan
                  </button>
                  
                  {/* Premium Hover Card */}
                  <div className=\"absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 p-5 bg-slate-900/95 backdrop-blur-xl rounded-[24px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-[100]\">
                    <div className=\"flex items-start gap-4\">
                      <div className=\"w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0 border border-primary/20\">
                        <BrainCircuit className=\"w-4 h-4\" />
                      </div>
                      <div>
                        <p className=\"text-[10px] font-black text-white uppercase tracking-[2px] mb-1.5 bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent\">Full Plan Synthesis</p>
                        <p className=\"text-[9px] font-semibold text-slate-400 leading-relaxed uppercase tracking-widest italic\">
                          Orchestrate AI to automatically draft captions, creative angles, and platform-specific hashtags for every post in your currently visible plan.
                        </p>
                        <div className=\"mt-3 pt-3 border-t border-white/5 flex items-center gap-2\">
                          <div className=\"w-1 h-1 rounded-full bg-emerald-500 animate-pulse\" />
                          <span className=\"text-[7px] font-black text-slate-500 uppercase tracking-widest\">Optimized for: {workspace?.workspaceName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className=\"flex-1 w-full overflow-y-auto custom-scrollbar\">
              {/* Desktop View */}
              <div className=\"hidden lg:block overflow-x-auto\">
                <table className=\"w-full text-left border-collapse table-auto\">
                  <thead>
                    <tr className=\"border-b border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01]\">
                      <th className=\"p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest\">Schedule</th>
                      <th className=\"p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest\">Platform</th>
                      <th className=\"p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest\">Phase</th>
                      <th className=\"p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest\">Strategy / Hook</th>
                      <th className=\"p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest\">Asset Type</th>
                      <th className=\"p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right\">Action</th>
                    </tr>
                  </thead>
                  <tbody className=\"divide-y divide-slate-100 dark:divide-white/5\">
                    {finalRows.map((row, idx) => (
                      <tr key={row._id || idx} className=\"group hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors\">
                        <td className=\"p-4\">
                          <div className=\"flex items-center gap-3 whitespace-nowrap\">
                            <div className=\"w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex flex-col items-center justify-center border border-slate-200 dark:border-white/10 group-hover:border-primary/30 transition-colors\">
                              <span className=\"text-[9px] font-black text-primary leading-none\">{new Date(row.scheduledDate).getDate()}</span>
                              <span className=\"text-[6px] font-black text-slate-400 uppercase tracking-tighter\">{new Date(row.scheduledDate).toLocaleString('default', { month: 'short' })}</span>
                            </div>
                          </div>
                        </td>
                        <td className=\"p-4\">
                          <div className=\"flex gap-1\">
                            {['instagram', 'linkedin', 'twitter', 'facebook', 'youtube'].map(p => {
                              const active = (row.platform || row.rawData?.Platform || '').toLowerCase().includes(p);
                              if (!active) return null;
                              return (
                                <div key={p} className=\"p-1.5 rounded-lg bg-primary/5 text-primary border border-primary/10 group-hover:border-primary/30 transition-all\">
                                  {p === 'instagram' && <Instagram className=\"w-3 h-3\" />}
                                  {p === 'linkedin' && <Linkedin className=\"w-3 h-3\" />}
                                  {p === 'twitter' && <Twitter className=\"w-3 h-3\" />}
                                  {p === 'facebook' && <Facebook className=\"w-3 h-3\" />}
                                  {p === 'youtube' && <Youtube className=\"w-3 h-3\" />}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        <td className=\"p-4\">
                          <span className=\"text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10\">
                            {row.phase || row.rawData?.Phase || \"Awareness\"}
                          </span>
                        </td>
                        <td className=\"p-4\">
                          <div className=\"max-w-[200px] xl:max-w-[350px]\">
                            <p className=\"text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight mb-0.5 truncate group-hover:text-primary transition-colors\">
                              {row.heading_hook || row.title || row.rawData?.Title}
                            </p>
                            <p className=\"text-[9px] text-slate-400 font-medium truncate italic opacity-60\">
                              {row.sub_heading || row.hook || row.rawData?.Hook || \"Defining direction...\"}
                            </p>
                          </div>
                        </td>
                        <td className=\"p-4\">
                          <span className={\px-2 py-0.5 rounded-full text-[8px] font-black uppercase border \\}>
                            {row.postType || row.format || row.rawData?.Format}
                          </span>
                        </td>
                        <td className=\"p-4 text-right\">
                          <div className=\"flex justify-end gap-2\">
                            {row.status === 'generated' ? (
                              <button 
                                onClick={() => {
                                  const post = generatedPosts.find(p => ensureStringId(p.calendarEntryId) === ensureStringId(row._id));
                                  const asset = assets.find(a => 
                                    (post && ensureStringId(a.postId) === ensureStringId(post._id)) || 
                                    ensureStringId(a.calendarEntryId) === ensureStringId(row._id)
                                  );
                                  if (asset) setSelectedAsset(asset);
                                }}
                                className=\"h-9 px-4 bg-emerald-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2\"
                              >
                                <Eye className=\"w-3 h-3\" /> View
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleGenerateContent('single', 1, [row._id])}
                                disabled={isGenerating}
                                className=\"h-9 px-4 bg-primary text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2\"
                              >
                                <Sparkle className=\"w-3 h-3\" /> Synthesis
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className=\"lg:hidden p-4 space-y-4\">
                {finalRows.map((row, idx) => (
                  <div key={row._id || idx} className=\"p-5 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-3xl space-y-4\">
                    <div className=\"flex items-center justify-between\">
                      <div className=\"flex items-center gap-3\">
                        <div className=\"w-10 h-10 rounded-xl bg-primary/10 flex flex-col items-center justify-center border border-primary/20\">
                          <span className=\"text-[11px] font-black text-primary leading-none\">{new Date(row.scheduledDate).getDate()}</span>
                          <span className=\"text-[7px] font-black text-slate-400 uppercase tracking-tighter\">{new Date(row.scheduledDate).toLocaleString('default', { month: 'short' })}</span>
                        </div>
                        <div>
                          <p className=\"text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight\">
                            {row.heading_hook || row.title || row.rawData?.Title}
                          </p>
                          <div className=\"flex items-center gap-2 mt-1\">
                            <span className=\"text-[8px] font-black text-slate-400 uppercase tracking-widest px-1.5 py-0.5 bg-white dark:bg-zinc-800 rounded border border-slate-200 dark:border-white/10\">
                              {row.phase || row.rawData?.Phase || \"Awareness\"}
                            </span>
                            <span className={\px-1.5 py-0.5 rounded text-[8px] font-black uppercase border \\}>
                              {row.postType || row.format || row.rawData?.Format}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className=\"flex gap-1\">
                        {['instagram', 'linkedin', 'twitter', 'facebook', 'youtube'].map(p => {
                          const active = (row.platform || row.rawData?.Platform || '').toLowerCase().includes(p);
                          if (!active) return null;
                          return (
                            <div key={p} className=\"p-1 rounded-lg bg-primary/5 text-primary border border-primary/10\">
                              {p === 'instagram' && <Instagram className=\"w-3 h-3\" />}
                              {p === 'linkedin' && <Linkedin className=\"w-3 h-3\" />}
                              {p === 'twitter' && <Twitter className=\"w-3 h-3\" />}
                              {p === 'facebook' && <Facebook className=\"w-3 h-3\" />}
                              {p === 'youtube' && <Youtube className=\"w-3 h-3\" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <p className=\"text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic border-l-2 border-primary/20 pl-3\">
                      {row.sub_heading || row.hook || row.rawData?.Hook || \"Defining direction...\"}
                    </p>

                    <div className=\"flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5\">
                      <div className=\"flex items-center gap-1.5\">
                        <div className={\w-1.5 h-1.5 rounded-full \\} />
                        <span className=\"text-[9px] font-black text-slate-400 uppercase tracking-widest\">
                          {row.status === 'generated' ? 'Ready' : 'Pending Synthesis'}
                        </span>
                      </div>
                      
                      {row.status === 'generated' ? (
                        <button 
                          onClick={() => {
                            const post = generatedPosts.find(p => ensureStringId(p.calendarEntryId) === ensureStringId(row._id));
                            const asset = assets.find(a => 
                              (post && ensureStringId(a.postId) === ensureStringId(post._id)) || 
                              ensureStringId(a.calendarEntryId) === ensureStringId(row._id)
                            );
                            if (asset) setSelectedAsset(asset);
                          }}
                          className=\"h-10 px-6 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2\"
                        >
                          <Eye className=\"w-3.5 h-3.5\" /> View
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleGenerateContent('single', 1, [row._id])}
                          disabled={isGenerating}
                          className=\"h-10 px-6 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2\"
                        >
                          <Sparkle className=\"w-3.5 h-3.5\" /> Synthesis
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className=\"p-20 bg-white dark:bg-[#080808]/50 rounded-[60px] border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-center\">
            <div className=\"w-20 h-20 rounded-3xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 mb-6\">
              <Layers className=\"w-8 h-8 opacity-20\" />
            </div>
            <h3 className=\"text-xs font-black text-slate-400 uppercase tracking-[4px]\">Awaiting Pipeline Connection</h3>
            <p className=\"text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2\">Select a brand strategy above to view and orchestrate content rows.</p>
          </div>
        )}
      </div>
    );
  };

  \;

    const updatedContent = content.substring(0, startIndex) + cleanSection + content.substring(endIndex);
    fs.writeFileSync('src/Components/AiSocialMediaDashboard.jsx', updatedContent, 'utf8');
    console.log('Fixed ISA structure and added mobile responsiveness');
} else {
    console.log('Could not find start or end markers');
}
