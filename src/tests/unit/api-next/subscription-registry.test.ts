import { Subscription } from "rxjs";
import { IBApiNext, IBApiNextError } from "../../..";

const _awaitTimeout = (delay: number): Promise<unknown> =>
  new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, delay * 1000));

describe("Subscription registry Tests", () => {
  jest.setTimeout(20000);

  const clientId = Math.floor(Math.random() * 32766) + 1; // ensure unique client

  let subscription$: Subscription;
  let api: IBApiNext;
  let error$: Subscription;

  beforeEach(() => {
    api = new IBApiNext();

    if (!error$) {
      error$ = api.errorSubject.subscribe((error) => {
        if (error.reqId === -1) {
          console.warn(`${error.error.message} (Error #${error.code})`);
        } else {
          console.error(
            `${error.error.message} (Error #${error.code}) ${
              error.advancedOrderReject ? error.advancedOrderReject : ""
            }`,
          );
        }
      });
    }

    try {
      api.connect(clientId);
    } catch (error) {
      console.error(error.message);
    }
  });

  afterEach(() => {
    if (api) {
      api.disconnect();
      api = undefined;
    }
  });

  it("Twice the same event callback bug", (done) => {
    subscription$ = api.getOpenOrders().subscribe({
      next: (data) => {
        console.log(data);
      },
      error: (err: IBApiNextError) => {
        console.error(`getOpenOrders failed with '${err.error.message}'`);
      },
    });

    api
      .getAllOpenOrders()
      .then((orders) => {
        console.log(orders);
        done();
      })
      .catch((err: IBApiNextError) => {
        console.error(`getAllOpenOrders failed with '${err}'`);
      });

    // awaitTimeout(15).then(() => {
    //   subscription$.unsubscribe();
    //   done();
    // });
  });
});
