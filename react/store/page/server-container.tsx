import React, { useLayoutEffect } from 'react';
import { canUseDOM } from 'vtex.render-runtime';

type ServerContainerProps = {
  isClient?: boolean;
};

export default function NostoServerContainerGenerator<P>(
  type: string,
  Component: React.FC<P>
): React.FC<ServerContainerProps & P> {
  const NostoServerContainer: React.FC<ServerContainerProps & P> = (props) => {
    const { isClient, children, ...rest } = props as React.PropsWithChildren<ServerContainerProps>;
    const componentProps = rest as P;

    useLayoutEffect(() => {
      if (!canUseDOM) {
        return;
      }

      const elements = document.querySelectorAll('.nosto-server-container');

      elements?.forEach((element) => {
        if (type && element.getAttribute('data-type') !== type) {
          return;
        }

        element.parentElement?.removeChild(element);
      });
    }, []);

    if (canUseDOM) {
      if (!isClient) {
        return null;
      }

      return (
        <>
          <Component {...componentProps} />
        </>
      );
    }

    return (
      <div className="nosto-server-container" data-type={type}>
        <Component {...componentProps} />
      </div>
    );
  };

  return NostoServerContainer;
}
