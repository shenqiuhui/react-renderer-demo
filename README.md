# 如何实现 React 跨平台渲染器

## React 架构的基本组成

- `Scheduler`（调度器）：调度任务的优先级，高优任务进入 `Reconciler` 执行；
- `Reconciler`（协调器）：负责找出组件的变化；
- `Renderer`（渲染器）：负责将变化的组件渲染到页面上。

### Scheduler（调度器）

`React` 为了防止页面卡顿，在 `React 16` 的架构中正式加入了 Fiber 架构，主要目的是为了实现 `js` 执行的任务可被中断和挂起，可以计算优先级。

### Reconciler（协调器）

`Scheduler` 将执行的任务交给 `Reconciler`，`Reconciler` 对 `Fiber` 树进行 `diff`，找出变化的节点，为变化的节点打上（增加/删除/更新）的标记和更新的数据信息，`Scheduler` 和 `Reconciler` 整个工作都在内存中进行。

### Renderer（渲染器）

根据 `Reconciler` 的标记，同步执行对应的渲染操作，对于浏览器来讲是执行 `DOM` 方法，对于其他的不同的平台都可以基于 `Reconciler` 实现不同的渲染逻辑，如：

- `ReactNative` 渲染器：渲染原生 `App`；
- `ReactArt` 渲染器：渲染到 `Canvas`、`SVG` 图形；
- `ReactTest` 渲染器：渲染 `js` 对象用于测试。

## 跨平台渲染器基本概念

### host environment & host component
- `host environment`：主机环境，相对 `React` 的不同的运行环境，如浏览器，原生 `APP` 等；
- `host component`：主机组件或内置组件，比如在浏览器环境（`div`，`span`，`img`）等，在 `Native` 环境（`View`，`Text`，`Image`）等。

### Fiber reconciler

`Fiber reconciler` 包含了架构层的 `Scheduler` 和 `Reconciler` 能力，是 `react-dom` 和 `react-native` 代码的一部分，`React` 团队为了方便共享 `React` 的核心功能，将其封装成了一个名为 `react-reconciler` 的 `npm` 模块（缺点：稳定性和文档）。

- `function components`
- `class components`
- `props`, `state`
- `effects`, `lifecycle`
- `key`, `ref`, `context`
- `React.lazy`, `error boundaries`
- `concurrent mode`, `Suspense`
- `react hooks`

### mutation mode & persistent mode

- `mutation mode`：突变模式，目标平台有类似于浏览器的 `DOM`，有类似于 `appendChild`、`removeChild` 等方法的情况使用该模式；
- `persistent mode`：持久模式，目标平台有 `immutable trees`，该模式下现有节点永远不会发生突变，每次更新都会找到更新节点的父树克隆更改并替换。
-

```js
// mutation mode
view = createView();
updateView(view, { color: 'red' });

div = document.createElement('div');
div.style.color = 'red';

// persistent mode
view = createView();
view = cloneView(view, { color: 'red' });跨平台代码实现import ReactReconciler from 'react-reconciler';
```

```js
const reconciler = ReactReconciler({
  // 开启突变模式
  supportsMutation: true,

  // 返回一个新创建的节点，在渲染阶段执行
  createInstance(
    type,
    props,
    rootContainerInstance,
    hostContext,
    internalInstanceHandle
  ) {},

  // 返回一个新创建的文本，在渲染阶段执行
  createTextInstance(
    text,
    rootContainerInstance,
    hostContext,
    internalInstanceHandle
  ) {},

  // 向父节点中追加一个子节点，父节点和子节点可以发生突变，在树构建中到渲染前执行
  appendInitialChild(parent, child) {},

  // 向父节点中追加一个子节点，父节点和子节点不允许发生突变，在 commit 阶段执行
  appendChild(parent, child) {},

  // 与 appendChild 类似，用于向根节点添加子节点
  appendChildToContainer(container, child) {},

  // 从父节点中移除子节点，要删除根节点前执行
  removeChild(parent, child) {},

  // 与 removeChild 类似，从根节点中移除子节点
  removeChildFromContainer(container, child) {},

  // 突变父节点，向某一子节点前插入节点
  insertBefore(parent, child, before) {},

  // 与 insertBefore 类似，适用于突变根节点的情况
  insertInContainerBefore(container, child, before) {},

  // 删除根节点下所有的节点
  clearContainer(container) {},

  // 比较 props 来决定是否更新节点，不需更新返回 null，需要则返回能表示发生更改的任一对象
  prepareUpdate(
    instance,
    type,
    oldProps,
    newProps,
    rootContainerInstance,
    currentHostContext
  ) {},

  // commit 阶段执行，可获取更新后的负载
  commitUpdate(
    instance,
    updatePayload,
    type,
    oldProps,
    newProps,
    finishedWork
  ) {},

  // 用于执行最终突变，此时所有子节点都已经添加到实例中，节点实例本身尚未渲染
  finalizeInitialChildren(
    instance,
    type,
    props,
    rootContainerInstance,
    hostContext
   ) {},

  // 用于更改 createInstance 的 hostContext 参数
  getChildHostContext(parentHostContext, type, rootContainerInstance) {},

  // 用于确定将要公开的实例的引用
  getPublicInstance(instance) {},

  // 用于返回初始的上下文
  getRootHostContext(rootContainerInstance) {},

  // 用于在更改树节点之前更改一些信息
  prepareForCommit(containerInfo) {},

  // 执行突变后立即调用，可以使用 prepareForCommit 中的信息
  resetAfterCommit(containerInfo) {},

  // 在某些平台可以自动为节点实例设置文本，无需使用 createTextInstance 创建文本
  shouldSetTextContent(type, props) {},
});

const ReactDOMMini = {
  render(whatToRender, root) {
    const container = reconciler.createContainer(root, false, false);
    reconciler.updateContainer(whatToRender, container, null, null);
  }
};

export default ReactDOMMini;
```

## 参考链接

- https://github.com/facebook/react/issues/6170
- https://zh-hans.reactjs.org/docs/codebase-overview.html#reconcilers
- https://zh-hans.reactjs.org/docs/codebase-overview.html#renderers
- https://github.com/facebook/react/blob/main/packages/react-reconciler/README.md
- https://agent-hunt.medium.com/hello-world-custom-react-renderer-9a95b7cd04bc
