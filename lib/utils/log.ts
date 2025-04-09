import R from 'ramda';

export const flatAnObject = (object: any) => {
  const recursiveFunction = (obj: any) => {
    return Object.entries(obj).reduce<Record<string, any>>((acc: Record<string, any>, [key, value]): Record<string, any> => {
      if (Array.isArray(value)) {
        const newValue = value.map((item) => (item?.id ? item.id : item));
        return { ...acc, [key]: newValue };
      } else if (value instanceof Error) {
        return { ...acc, [key]: value.stack };
      } else if (value?.constructor?.name && ['Object'].includes(value.constructor.name)) {
        return { ...acc, [key]: recursiveFunction(value) };
      }
      return { ...acc, [key]: value };
    }, {});
  };

  return recursiveFunction(object);
};

export const maskLogResult = (result: any) => {
  if (
    !['Array', 'Object', 'String', 'Number', 'Symbol', 'Boolean'].includes(
      result?.constructor?.name,
    )
  ) {
    return result;
  }

  if (Array.isArray(result)) {
    return result.map((item) => (item?.id ? item.id : item));
  }

  if (R.is(Object, result)) {
    return flatAnObject(result);
  }

  return result;
};

export const maskLogArgs = (args: any[]) => {
  return (args || []).reduce((acc, arg) => {
    if (
      ['Array', 'Object', 'String', 'Number', 'Symbol', 'Boolean'].includes(
        arg?.constructor?.name,
      )
    ) {
      return [...acc, maskLogResult(arg)];
    }
    return acc;
  }, []);
};
