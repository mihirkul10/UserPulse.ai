export class ProgressController {
  private current = 0;
  private target = 0;

  // Call on UI interval (e.g., 60fps) to smoothly ease toward target
  tick(): number {
    const delta = this.target - this.current;
    this.current += delta * 0.12; // easing
    if (Math.abs(delta) < 0.5) this.current = this.target;
    return Math.min(100, Math.max(0, this.current));
  }

  // Set to a weighted milestone (0..100)
  setTarget(pct: number): void {
    if (typeof pct !== 'number' || isNaN(pct)) {
      return;
    }
    this.target = Math.max(this.target, Math.min(100, Math.max(0, pct)));
  }

  reset(): void {
    this.current = 0;
    this.target = 0;
  }

  getCurrent(): number {
    return this.current;
  }

  getTarget(): number {
    return this.target;
  }
}

// Progress weights (sum = 100)
export const PROGRESS_WEIGHTS = {
  CONTEXT: 10,        // Build context (me)
  MINE_ME: 20,        // Query Reddit for MY PRODUCT  
  MINE_COMPETITORS: 25, // Query Reddit for COMPETITORS
  FILTER: 10,         // Filter for UX/feedback
  CLASSIFY: 15,       // Cluster & classify
  COMPOSE: 15,        // Compose markdown
  CSV: 5,            // Assemble CSV appendix
} as const;
