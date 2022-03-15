import ReactReconciler from 'react-reconciler';

const reconciler = ReactReconciler({
  supportsMutation: true,
  createInstance(
    type,
    props,
    rootContainerInstance,
    hostContext,
    internalInstanceHandle
  ) {
    const el = document.createElement(type);

    ['alt', 'className', 'href', 'rel', 'src', 'target'].forEach((key) => {
      if (props[key]) {
        el[key] = props[key];
      }
    });

    if (props.bgColor) {
      el.style.backgroundColor = props.bgColor;
    }

    if (props.onClick) {
      el.addEventListener('click', props.onClick);
    }

    return el;
  },
  createTextInstance(
    text,
    rootContainerInstance,
    hostContext,
    internalInstanceHandle
  ) {
    return document.createTextNode(text);
  },
  appendChildToContainer(container, child) {
    container.appendChild(child);
  },
  appendChild(parent, child) {
    parent.appendChild(child);
  },
  appendInitialChild(parent, child) {
    parent.appendChild(child);
  },
  removeChildFromContainer(container, child) {
    container.removeChild(child);
  },
  removeChild(parent, child) {
    parent.removeChild(child);
  },
  insertInContainerBefore(container, child, before) {
    container.insertBefore(child, before);
  },
  insertBefore(parent, child, before) {
    parent.insertBefore(child, before);
  },
  clearContainer(container) {},
  prepareUpdate(
    instance,
    type,
    oldProps,
    newProps,
    rootContainerInstance,
    currentHostContext
  ) {
    let payload;

    if (oldProps.bgColor !== newProps.bgColor) {
      payload = { newBgColor: newProps.bgColor };
    }

    return payload;
  },
  commitUpdate(
    instance,
    updatePayload,
    type,
    oldProps,
    newProps,
    finishedWork
  ) {
    if (updatePayload.newBgColor) {
      instance.style.backgroundColor = updatePayload.newBgColor;
    }
  },
  finalizeInitialChildren() {},
  getChildHostContext() {},
  getPublicInstance() {},
  getRootHostContext() {},
  prepareForCommit() {
    return null;
  },
  resetAfterCommit() {},
  shouldSetTextContent() {
    return false;
  },
});

const ReactDOMMini = {
  render(whatToRender, root) {
    const container = reconciler.createContainer(root, false, false);
    reconciler.updateContainer(whatToRender, container, null, null);
  }
};

export default ReactDOMMini;
