import { useMemo, useEffect, useState } from 'react';
import { useQuery } from 'react-apollo';
import { useRuntime } from 'vtex.render-runtime';
import type { OrderGroup } from 'vtex.order-placed/OrderGroupContext';

import ORDER_QUERY from './order-query.graphql';
import type { NostoAddOrderProps } from '../typings/nosto';
import { transformCartItems } from '../hooks/use-nosto-dependencies';

interface OrderPageProps {
  placements?: string | string[];
  orderNumber?: string;
}

const NostoOrderPage: React.FC<OrderPageProps> = ({ placements, orderNumber }) => {
  const { query } = useRuntime();
  const [sent, setSent] = useState(false);

  const {
    data: queryData,
    loading,
    error,
  } = useQuery<{ orderGroup: OrderGroup }>(ORDER_QUERY, {
    variables: {
      orderGroup: orderNumber ?? query?.og,
    },
  });

  const ordersData = useMemo(() => {
    if (loading || error || !queryData?.orderGroup) {
      return false;
    }

    return queryData.orderGroup.orders.map((order) => {
      const data: NostoAddOrderProps = {
        external_order_ref: order.orderId,
        info: {
          email: order.clientProfileData.email,
          first_name: order.clientProfileData.firstName ?? undefined,
          last_name: order.clientProfileData.lastName ?? undefined,
          // TODO
          newsletter: false,
          order_number: order.orderId,
          type: 'order',
        },
        items: transformCartItems(order.items, { currencyCode: order.storePreferencesData.currencyCode }),
      };

      return data;
    });
  }, [error, loading, queryData]);

  useEffect(() => {
    if (!ordersData || sent) {
      return;
    }

    ordersData.reduce(async (acc, order, idx) => {
      await acc;

      return sendOrder(order, !idx, placements);
    }, Promise.resolve(true));

    setSent(true);
  }, [ordersData, placements, sent]);

  return null;
};

export default NostoOrderPage;

function sendOrder(order: NostoAddOrderProps, first: boolean, forcePlacements?: string | string[]): Promise<boolean> {
  return new Promise((resolve, reject) => {
    window.nostojs((api) => {
      const placements = (
        forcePlacements
          ? Array.isArray(forcePlacements)
            ? forcePlacements
            : [forcePlacements]
          : api.placements.getPlacements()
      ).map((placement) => String(placement));

      api
        .defaultSession()
        .setResponseMode('HTML')
        .addOrder(order)
        .setPlacements(placements)
        [first ? 'load' : 'update']()
        .then((resp) => {
          api.placements.injectCampaigns(resp.recommendations);
          resolve(true);
        })
        .catch(reject);
    });
  });
}
