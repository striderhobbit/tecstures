import {
  Subject,
  Subscription,
  animationFrameScheduler,
  concat,
  concatMap,
  defer,
  filter,
  finalize,
  scheduled,
  take,
} from 'rxjs';

interface Move {
  id: string;
}

interface MoveFactory<M extends Move> {
  (move: M): void;
}

export class AnimationScheduler<M extends Move> {
  #currentMove?: M | null;

  public get currentMove(): M | undefined | null {
    return this.#currentMove;
  }

  private readonly animations$: Subject<string> = new Subject();
  private readonly moves$: Subject<M> = new Subject();
  private readonly scheduledMoves$ = this.moves$.pipe(
    concatMap((move) =>
      scheduled(
        concat(
          defer(async () => (this.#currentMove = move)),
          this.animations$.pipe(
            filter((id) => move.id === id),
            take(27),
            finalize(() => {
              this.factory(move);
              this.#currentMove = null;
            })
          )
        ),
        animationFrameScheduler
      )
    )
  );

  constructor(private readonly factory: MoveFactory<M>) {}

  public complete(): void {
    this.animations$.next(this.#currentMove!.id);
  }

  public next(move: M): void {
    this.moves$.next(move);
  }

  public subscribe(): Subscription {
    return this.scheduledMoves$.subscribe();
  }
}
