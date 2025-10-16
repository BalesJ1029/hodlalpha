import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { type FunctionComponent, type JSX } from 'react';

const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error('PUBLIC_CONVEX_URL is not defined. Add it to your environment configuration.');
}

const client = new ConvexReactClient(convexUrl);

export function withConvexProvider<Props extends JSX.IntrinsicAttributes>(
  Component: FunctionComponent<Props>
): FunctionComponent<Props> {
  return function WithConvexProvider(props: Props) {
    return (
      <ConvexProvider client={client}>
        <Component {...props} />
      </ConvexProvider>
    );
  };
}
