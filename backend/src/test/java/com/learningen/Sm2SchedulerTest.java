package com.learningen;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class Sm2SchedulerTest {
    private final Sm2Scheduler scheduler=new Sm2Scheduler();
    @Test void successfulRepetitionsFollowSm2Intervals() {
        var one=scheduler.next(0,0,2.5,Sm2Scheduler.Rating.GOOD);
        assertThat(one.intervalDays()).isEqualTo(1);
        var two=scheduler.next(one.repetitions(),one.intervalDays(),one.ease(),Sm2Scheduler.Rating.GOOD);
        assertThat(two.intervalDays()).isEqualTo(6);
        assertThat(scheduler.next(2,6,2.5,Sm2Scheduler.Rating.GOOD).intervalDays()).isEqualTo(15);
    }
    @Test void lapseResetsRepetitionsAndEaseHasFloor() {
        var failed=scheduler.next(5,100,1.3,Sm2Scheduler.Rating.AGAIN);
        assertThat(failed.repetitions()).isZero();assertThat(failed.intervalDays()).isEqualTo(1);assertThat(failed.ease()).isEqualTo(1.3);
        assertThat(scheduler.next(2,6,2.5,Sm2Scheduler.Rating.EASY).ease()).isGreaterThan(2.5);
        assertThat(scheduler.next(2,6,2.5,Sm2Scheduler.Rating.HARD).ease()).isLessThan(2.5);
    }
}
