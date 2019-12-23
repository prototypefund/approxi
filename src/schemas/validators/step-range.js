export default ajv => {
  ajv.addKeyword('stepRange', {
    type: 'number',
    $data: true,
    errors: false,
    validate(schema, data) {
      const [min, max] = schema;
      const diff = Math.abs(max - min);
      const ok = data > 0 && data <= diff;
      return ok;
    },
    metaSchema: {
      type: 'array',
      minItems: 2,
      maxItems: 2,
      items: [
        { type: 'number' },
        { type: 'number' }
      ],
      additionalItems: false
    }
  });
};
