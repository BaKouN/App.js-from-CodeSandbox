import * as THREE from 'three'
import { useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Image, ScrollControls, Scroll, useScroll, Text } from '@react-three/drei'
import { proxy, useSnapshot } from 'valtio'
import { easing } from 'maath'

import { slides } from './gallery'

const material = new THREE.LineBasicMaterial({ color: 'white' })
const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -0.5, 0), new THREE.Vector3(0, 0.5, 0)])

const bottomGap = 0.5;
const tickGap   = 0.06;  

const state = proxy({
  clicked: null,
  slides
});

const frLabel = new Intl.DateTimeFormat('fr-FR', {
  day:   'numeric',
  month: 'long'
});

function Minimap() {
  const groupRef  = useRef();          // ticks + textes
  const titleRef  = useRef();          // titre dynamique
  const dateRef   = useRef();          // date dynamique
  const scroll    = useScroll();
  const { width, height } = useThree((s) => s.viewport);
  const { slides } = useSnapshot(state);

  const stripHalf = (slides.length * tickGap) / 2;
  const titreMaxWidth = width * 0.8; // max width of the title text

  useFrame((_, dt) => {
    /* — animation “respiration” des ticks — */
    groupRef.current.children.forEach((child) => {
      if (child.userData.isTick) {
        const i = child.userData.idx;
        const y = scroll.curve(i / slides.length - 1.5 / slides.length, 4 / slides.length);
        easing.damp(child.scale, 'y', 0.15 + y / 6, 0.15, dt);
      }
    });

    /* — index du slide le plus proche du centre — */
    const idx = Math.round(scroll.offset * (slides.length - 1));

    /* — maj du titre — */
    const newTitle = slides[idx].title;
    if (titleRef.current.text !== newTitle) titleRef.current.text = newTitle;

    /* — maj de la date — */
    const newDate = frLabel.format(new Date(slides[idx].date));
    if (dateRef.current.text !== newDate) dateRef.current.text = newDate;
    easing.damp(dateRef.current.position, 'x', -stripHalf + idx * tickGap, 0.2, dt);
  });

  return (
    <group ref={groupRef}>
      {/* ticks */}
      {slides.map((_, i) => (
        <line
          key={i}
          geometry={geometry}
          material={material}
          position={[
            -stripHalf + i * tickGap,
            -height / 2 + 0.6 + bottomGap,
            0
          ]}
          userData={{ isTick: true, idx: i }}
        />
      ))}

      {/* titre dynamique (au-dessus de la barre) */}
      <Text
        ref={titleRef}
        position={[0, -height / 2 + 1 + bottomGap, 0]}
        fontSize={0.22}
        maxWidth={titreMaxWidth}  /* max width for the title */
        textAlign='center'
        anchorX="center"
        anchorY="middle"
        color="#ffffff"
      >
        {slides[0].title}
      </Text>

      {/* date dynamique (plus petite, un peu plus bas) */}
      <Text
        ref={dateRef}
        position={[0, -height / 2 + 0.3 + bottomGap, 0]}
        fontSize={0.12}            /* plus petit */
        anchorX="center"
        anchorY="middle"
        color="#ffffff"
      >
        {frLabel.format(new Date(slides[0].date))}
      </Text>
    </group>
  );
}

function Item({ index, position, scale, slide, c = new THREE.Color(), ...props }) {
  // ————————————————————————————————————————————————————————
  // Refs & reactive values
  const ref    = useRef();                 // pointer to this <Image>
  const scroll = useScroll();              // drei helper: 0‒1 scroll value
  const { clicked, slides } = useSnapshot(state); // read proxy state
  const [hovered, hover] = useState(false);       // local hover state

  // ————————————————————————————————————————————————————————
  // Event handlers (unchanged)
  const click = () => (state.clicked = index === clicked ? null : index);
  const over  = () => hover(true);
  const out   = () => hover(false);

  // ————————————————————————————————————————————————————————
  // Per-frame animation logic (unchanged math; just uses slides.length)
  useFrame((_, delta) => {
    const y = scroll.curve(index / slides.length - 1.5 / slides.length, 4 / slides.length);

    // Scale the plane itself
    easing.damp3(
      ref.current.scale,
      [clicked === index ? 4.7 : scale[0], clicked === index ? 5 : 4 + y, 1],
      0.15,
      delta
    );

    // Sync the internal texture scaling with the mesh scaling
    ref.current.material.scale[0] = ref.current.scale.x;
    ref.current.material.scale[1] = ref.current.scale.y;

    // Slide left/right when another tile is clicked
    if (clicked !== null && index < clicked)
      easing.damp(ref.current.position, 'x', position[0] - 2, 0.15, delta);
    if (clicked !== null && index > clicked)
      easing.damp(ref.current.position, 'x', position[0] + 2, 0.15, delta);
    if (clicked === null || clicked === index)
      easing.damp(ref.current.position, 'x', position[0], 0.15, delta);

    // Grayscale fade based on distance + hover
    easing.damp(
      ref.current.material,
      'grayscale',
      hovered || clicked === index ? 0 : Math.max(0, 1 - y),
      0.15,
      delta
    );

    // Color tint (white on hover/click, light-gray otherwise)
    easing.dampC(
      ref.current.material.color,
      hovered || clicked === index ? 'white' : '#aaa',
      hovered ? 0.3 : 0.15,
      delta
    );
  });

  // ————————————————————————————————————————————————————————
  // Render: same props, just pass slide.url explicitly
  return (
    <Image
      ref={ref}
      url={slide.url}            /* NEW: pull URL from the slide object */
      position={position}
      scale={scale}
      onClick={click}
      onPointerOver={over}
      onPointerOut={out}
      {...props}                /* keep any extra props you forward in <Items /> */
    />
  );
}

function Items({ w = 1.5, gap = 0.6 }) {
  const { width } = useThree((s) => s.viewport);
  const xW = w + gap;

  return (
    <ScrollControls horizontal damping={0.1} pages={(width - xW + state.slides.length * xW) / width}>
      <Minimap xW={xW} />
      <Scroll>
        {state.slides.map((slide, i) => (
          <Item
            key={i}
            index={i}
            position={[i * xW, bottomGap, 0]}
            scale={[w, 4, 1]}
            slide={slide}   // pass whole object
          />
        ))}
      </Scroll>
    </ScrollControls>
  );
}

export const App = () => (
  <Canvas gl={{ antialias: false }} dpr={[1, 1.5]} onPointerMissed={() => (state.clicked = null)}>
    <Items className="gallery" />
  </Canvas>
)
