import type React from 'react';
import { useEffect } from 'react';

import useNostoDependencies from '../hooks/use-nosto-dependencies';

const NostoOtherPage: React.FC = () => {
  const { allDataFinished, isFirstSend, nostojs } = useNostoDependencies();

  useEffect(() => {
    if (!allDataFinished || !isFirstSend) {
      return;
    }

    nostojs((session) => {
      return session.viewOther();
    });
  }, [allDataFinished, nostojs, isFirstSend]);

  return null;
};

export default NostoOtherPage;
