package com.learningen;

import org.springframework.stereotype.Component;

/** Deliberately simple SM-2 baseline; not FSRS. Intervals are whole days. */
@Component
public class Sm2Scheduler {
    public enum Rating { AGAIN, HARD, GOOD, EASY }
    public record Schedule(int repetitions, int intervalDays, double ease) {}
    public Schedule next(int repetitions, int interval, double ease, Rating rating) {
        int quality = switch (rating) { case AGAIN -> 1; case HARD -> 3; case GOOD -> 4; case EASY -> 5; };
        double updatedEase = Math.max(1.3, ease + 0.1 - (5-quality) * (0.08 + (5-quality) * 0.02));
        if (rating == Rating.AGAIN) return new Schedule(0, 1, updatedEase);
        int days = repetitions == 0 ? 1 : repetitions == 1 ? 6 : (int)Math.min(36500, Math.round(interval * ease));
        return new Schedule(repetitions + 1, days, updatedEase);
    }
}
