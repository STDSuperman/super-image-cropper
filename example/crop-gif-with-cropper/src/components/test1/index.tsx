// @ts-nocheck
import { useWorkerParser, usePlayerState, usePlayback, Canvas } from "@react-gifs/tools";

export default () => {
  // default state
  const [state, update] = usePlayerState();

  //  load and parse gif
  useWorkerParser('http://localhost:3000/test.gif', update);

  console.log('***进来');

  // updates current index
  usePlayback(state, () => update(({ index }) => ({ index: index + 1 })));

  // render frames
  return <Canvas {...state} />;
};