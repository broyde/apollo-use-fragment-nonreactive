## Example of unexpected `useFragment` work in apollo-client.
See `test.js`.

## How to run
1. Clone this repo.
2. `yarn install`
3. `yarn test`

## Expected result:
`useFragment` should not react to `@nonreactive` field(`status`) change, so `Trails` component should not re-render.
The test should pass.

## Actual result:
`Trails` component updates even when `status` changes. Test fails:
```
 FAIL  ./test.js
  × Should not react to @nonreactive field changes (135 ms)

  ● Should not react to @nonreactive field changes

    expect(jest.fn()).not.toHaveBeenCalled()

    Expected number of calls: 0
    Received number of calls: 1

    1: called with 0 arguments

       96 |   fireEvent.click(trail);
       97 |   await screen.findByText('CLOSED');
    >  98 |   expect(onTrailsRender).not.toHaveBeenCalled();
          |                              ^
       99 |   expect(onTrailRender).toHaveBeenCalledTimes(1);
      100 | });
      101 |

      at Object.toHaveBeenCalled (test.js:98:30)
```
