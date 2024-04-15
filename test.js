/** @jest-environment jsdom */

const React = require('react');
const {gql, InMemoryCache, useFragment, useQuery} = require('@apollo/client');
const {MockedProvider} = require('@apollo/client/testing');
const {fireEvent, render, screen} = require('@testing-library/react');

const TRAIL_FRAGMENT = gql`
  fragment TrailFragment on Trail {
    status
  }
`;

const TRAILS_FRAGMENT = gql`
  fragment TrailsFragment on Query {
    trails {
      id
      ...TrailFragment @nonreactive
    }
  }
  ${TRAIL_FRAGMENT}
`;

const onTrailRender = jest.fn();

const Trail = ({ id, onClick }) => {
  const { data } = useFragment({
    fragment: TRAIL_FRAGMENT,
    from: {
      __typename: 'Trail',
      id,
    },
  });

  onTrailRender();

  return (
    <li key={id} onClick={onClick}>{data.status}</li>
  );
};

const onTrailsRender = jest.fn();

const Trails = ({ onTrailClick }) => {
  const { data } = useFragment({
    fragment: TRAILS_FRAGMENT,
    fragmentName: 'TrailsFragment',
    from: {__typename: 'Query'},
  });

  onTrailsRender();

  return (
    <main>
      <h2>We have {data.trails.length} ski trails</h2>
      <ul>
        {data.trails.map((trail) => (
          <Trail key={trail.id} id={trail.id} onClick={onTrailClick} />
        ))}
      </ul>
    </main>
  );
}

it('Should not react to @nonreactive field changes', async () => {
  const cache = new InMemoryCache();
  cache.writeFragment({
    fragment: TRAILS_FRAGMENT,
    fragmentName: 'TrailsFragment',
    data: {
      trails: [
        {id: 1, status: 'OPEN', __typename: 'Trail'},
      ],
      __typename: 'Query',
    },
  });

  const onTrailClick = () => {
    cache.writeFragment({
      id: 'Trail:1',
      fragment: TRAIL_FRAGMENT,
      data: {status: 'CLOSED', __typename: 'Trail'},
    });
  };

  render(
    <MockedProvider cache={cache}>
      <Trails onTrailClick={onTrailClick} />
    </MockedProvider>
  );
  const trail = screen.getByText('OPEN');

  onTrailsRender.mockClear();
  onTrailRender.mockClear();

  fireEvent.click(trail);
  await screen.findByText('CLOSED');
  expect(onTrailsRender).not.toHaveBeenCalled();
  expect(onTrailRender).toHaveBeenCalledTimes(1);
});
