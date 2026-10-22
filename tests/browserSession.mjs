/* Existing-playthrough fixtures dismiss onboarding; playback.mjs tests first entry. */
export async function returningPage(context){
 await context.addInitScript(()=>{try{localStorage.setItem('callOfgukmin__tutorial_hidden__v1','1');}catch{}});
 return context.newPage();
}
