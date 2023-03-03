import { useState, useCallback, useEffect } from 'react';
import { useOrderForm } from 'vtex.order-manager/OrderForm';
import { useRenderSession } from 'vtex.session-client';
import type { SessionSuccess } from 'vtex.session-client/react/SessionTypes';
import type { OrderFormItem } from 'vtex.order-manager/OrderForm';
import { useRuntime } from 'vtex.render-runtime/react/components/RenderContext';

import type { NostoApiSession, NostoApiSessionPage, NostoApi, NostoLoadResponse } from '../typings/nosto';

export type UseNostoDependenciesProps = {
  useCart?: boolean;
  useCustomer?: boolean;
  useVariation?: boolean;
  usePlacements?: boolean;
  forcePlacements?: string | string[];
  startWithLoad?: boolean;
};

type NostoCallback = {
  (session: NostoApiSession, api: NostoApi): NostoApiSessionPage;
};

export type UseNostoDependenciesData = {
  allDataFinished: boolean;
  isFirstSend: boolean;
  nostojs: (cb: NostoCallback) => Promise<NostoLoadResponse>;
};

export default function useNostoDependencies(data?: UseNostoDependenciesProps): UseNostoDependenciesData {
  const {
    useCart = true,
    useCustomer = true,
    useVariation = true,
    usePlacements = true,
    startWithLoad = true,
    forcePlacements,
  } = data ?? {};

  const [isFirstSend, setIsFirstSend] = useState(true);
  const [allDataFinished, setAllDataFinished] = useState(false);
  const {
    orderForm: { items },
    loading: orderLoading,
  } = useOrderForm();

  const { loading: sessionLoading, error: sessionError, session: customerSession } = useRenderSession();

  const {
    culture: { currency },
  } = useRuntime();

  useEffect(() => {
    let result = true;

    if (useCustomer) {
      if (sessionError) {
        result = false;
      }

      if (sessionLoading) {
        result = false;
      }
    }

    if (useCart && orderLoading) {
      result = false;
    }

    if (useVariation && !currency) {
      result = false;
    }

    let promise: Promise<void> = Promise.resolve();

    if (result) {
      // avoid race condition with placements
      promise = sleep(100);
    }

    promise.then(() => setAllDataFinished(result));
  }, [useCustomer, useCart, orderLoading, useVariation, currency, sessionError, sessionLoading]);

  const nostojs = useCallback(
    async (cb: NostoCallback) => {
      return new Promise<NostoLoadResponse>((resolve, reject) => {
        if (!allDataFinished) {
          return reject(new Error('You should wait the allDataFinished'));
        }

        window.nostojs((api) => {
          let session = api.defaultSession().setResponseMode('HTML');

          // for v2
          // if (useVariation) {
          //   session = session.setVariation(currency);
          // }

          if (useCustomer) {
            session = setCustomer(session, customerSession as SessionSuccess);
          }

          if (useCart) {
            session = setCart(session, items, { currencyCode: currency });
          }

          let pageSession = cb(session, api);

          if (usePlacements) {
            if (forcePlacements) {
              const placements = Array.isArray(forcePlacements) ? forcePlacements : [forcePlacements];

              pageSession = pageSession.setPlacements(placements.map((placement) => String(placement)));
            } else {
              pageSession = pageSession.setPlacements(api.placements.getPlacements());
            }
          }

          let promise: Promise<NostoLoadResponse>;

          if (isFirstSend && startWithLoad) {
            promise = pageSession.load();
          } else {
            promise = pageSession.update();
          }

          if (isFirstSend) {
            setIsFirstSend(false);
          }

          promise
            .then((response) => {
              if (usePlacements) {
                api.placements.injectCampaigns(response.recommendations);
              }

              resolve(response);
            })
            .catch(reject);
        });
      });
    },
    [
      allDataFinished,
      currency,
      customerSession,
      forcePlacements,
      isFirstSend,
      items,
      startWithLoad,
      useCart,
      useCustomer,
      usePlacements,
    ]
  );

  return {
    allDataFinished,
    isFirstSend,
    nostojs,
  };
}

function setCustomer(session: NostoApiSession, customer: SessionSuccess) {
  const customerData = transformCustomer(customer);

  if (!customerData) {
    return session.setCustomer({});
  }

  return session.setCustomer(customerData);
}

type Profile = {
  isAuthenticated: {
    value?: string; // "false" / "true"
  };
  id: {
    value?: string;
  };
  email: {
    value?: string;
  };
  firstName: {
    value?: string;
  };
  lastName: {
    value?: string;
  };
};

function transformCustomer(customer: SessionSuccess) {
  const {
    isAuthenticated: { value: isAuthenticated },
    id: { value: reference },
    email: { value: email },
    firstName: { value: firstName },
    lastName: { value: lastName },
  } = {
    isAuthenticated: {},
    id: {},
    email: {},
    firstName: {},
    lastName: {},
    ...customer.namespaces.profile,
  } as Profile;

  if (isAuthenticated !== 'true') {
    return false;
  }

  return {
    customer_reference: reference,
    email,
    first_name: firstName,
    last_name: lastName,
    // TODO
    newsletter: false,
  };
}

type OrderItem = Pick<OrderFormItem, 'skuName' | 'productId' | 'id' | 'quantity' | 'price'>;

function setCart(session: NostoApiSession, items: OrderItem[], options?: TransformCartItemsOptions) {
  const cart = {
    items: transformCartItems(items, options),
  };

  return session.setCart(cart);
}

type TransformCartItemsOptions = {
  currencyCode?: string;
};
export function transformCartItems(items: OrderItem[], options?: TransformCartItemsOptions) {
  const { currencyCode } = {
    currencyCode: 'USD',
    ...options,
  };

  return items.map((item) => ({
    name: item.skuName,
    // TODO
    price_currency_code: currencyCode,
    product_id: item.productId,
    sku_id: item.id,
    quantity: item.quantity,
    unit_price: item.price / 100,
  }));
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
