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

interface MoveCallback<M extends Move> {
  (this: AnimationScheduler<M>, move: M): void;
}

export class AnimationScheduler<M extends Move> {
  private readonly callback?: MoveCallback<M>;
  private readonly count: number;

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
            take(this.count),
            finalize(() => {
              this.callback?.call(this, move);
              this.#currentMove = null;
            })
          )
        ),
        animationFrameScheduler
      )
    )
  );

  constructor({
    callback,
    count,
  }: {
    callback?: MoveCallback<M>;
    count: number;
  }) {
    this.callback = callback;
    this.count = count;
  }

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
