import { IMAGE_PATHS } from "./config/paths.js";

export function runCountdown(onDone) {
    //make overlay
        // prevent duplicate overlays if called twice quickly
        const existing = document.getElementById("countdownOverlay");
        if (existing) existing.remove();
      
        const overlay = document.createElement("div");
        overlay.id = "countdownOverlay";
        overlay.className = "countdown-overlay";
        overlay.setAttribute("role", "status");
        overlay.setAttribute("aria-live", "polite");
        document.body.appendChild(overlay);
      
        const steps = [
          IMAGE_PATHS.countdown3,
          IMAGE_PATHS.countdown2,
          IMAGE_PATHS.countdown1,
          IMAGE_PATHS.countdownGo,
        ];
      
        // preload to avoid first-frame blanks
        steps.forEach(src => { const img = new Image(); img.src = src; });
    let i = 0;

    const showStep = () => {
        overlay.innerHTML = `<img src="${steps[i]}" alt="images" class="countdown-img">`;
        overlay.classList.remove('pop'); // reset animation
        void overlay.offsetWidth;
        overlay.classList.add('pop');

        i++;
        if (i < steps.length) {
            setTimeout(showStep, 1000);
        } else {
            setTimeout(() => {
                overlay.remove();
                if (typeof onDone === 'function') onDone();
            }, 700);
        }
};
    showStep();
}
