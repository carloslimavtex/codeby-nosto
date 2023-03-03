import type React from 'react';
import { useEffect } from 'react';
import { useProduct } from 'vtex.product-context';
import { useRuntime } from 'vtex.render-runtime';

import useNostoDependencies from '../hooks/use-nosto-dependencies';

const NostoProductPageClient: React.FC = () => {
  const { query } = useRuntime();
  const { allDataFinished, isFirstSend, nostojs } = useNostoDependencies();

  const { product } = useProduct() ?? {};

  useEffect(() => {
    if (!allDataFinished || !product || !isFirstSend) {
      return;
    }

    nostojs((session) => {
      const sess = session.viewProduct(product.productId);

      if (query?.nosto) {
        return sess.setRef(product.productId, query.nosto);
      }

      return sess;
    });
  }, [allDataFinished, isFirstSend, nostojs, product, query]);

  return null;
};

export default NostoProductPageClient;
