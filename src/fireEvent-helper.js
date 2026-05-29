const fireEvent = (node, type, detail = {}) => {
  const event = new CustomEvent(type, {
    bubbles: true,
    cancelable: false,
    composed: true,
    detail,
  });

  node.dispatchEvent(event);

  return event;
};

export default fireEvent;
