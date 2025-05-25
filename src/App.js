import * as THREE from 'three'
import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Image, ScrollControls, Scroll, useScroll, Text } from '@react-three/drei'
import { proxy, useSnapshot } from 'valtio'
import { easing } from 'maath'

import { slides } from './gallery'

const material = new THREE.LineBasicMaterial({ color: 'white' })
const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -0.5, 0), new THREE.Vector3(0, 0.5, 0)])

const bottomGap = 1;
const tickGap   = 0.06;  

const state = proxy({
  clicked: null,
  slides
});

const frLabel = new Intl.DateTimeFormat('fr-FR', {
  day:   'numeric',
  month: 'long'
});

function AutoCloseWhenStable({ xW, threshold = 0.5 }) {
  const scroll = useScroll()
  const { width } = useThree((s) => s.viewport)
  const { clicked } = useSnapshot(state)

  const targetScrollPosition = useRef(null)
  const isAtTarget = useRef(false)
  const lastManualOffset = useRef(null)

  // When an image is clicked, calculate where we should scroll to
  useEffect(() => {
    if (clicked !== null) {
      // Calculate the target scroll position for this clicked image
      const totalWorldWidth = state.slides.length * xW
      const targetRatio = clicked / (state.slides.length - 1)
      targetScrollPosition.current = targetRatio
      isAtTarget.current = false
      lastManualOffset.current = null
    }
  }, [clicked, xW])

  useFrame(() => {
    if (clicked === null) return

    const currentOffset = scroll.offset

    // Check if we've reached the target position (within a small tolerance)
    if (!isAtTarget.current && targetScrollPosition.current !== null) {
      const tolerance = 0.02 // 2% tolerance
      if (Math.abs(currentOffset - targetScrollPosition.current) < tolerance) {
        isAtTarget.current = true
        lastManualOffset.current = currentOffset
        return
      }
      // Still scrolling to target, don't check for auto-close
      return
    }

    // We're at the target position, now detect manual scrolling
    if (isAtTarget.current && lastManualOffset.current !== null) {
      // Calculate total distance moved from the target position
      const totalDistanceFromTarget = Math.abs(currentOffset - targetScrollPosition.current)

      // If we've moved significantly away from target, check for auto-close
      if (totalDistanceFromTarget > 0.02) {
        // 2% total movement from target
        const totalWorldWidth = state.slides.length * xW
        const scrollWorldPos = currentOffset * totalWorldWidth
        const viewportCenter = scrollWorldPos + width / 2
        const clickedSlideCenter = clicked * xW + xW / 2

        const distanceFromCenter = Math.abs(viewportCenter - clickedSlideCenter)
        const closeThreshold = width * threshold

        if (distanceFromCenter > closeThreshold) {
          state.clicked = null
        }
      }

      lastManualOffset.current = currentOffset
    }
  })

  return null
}

function Minimap() {
  const groupRef  = useRef();          // ticks + textes
  const titleRef  = useRef();          // titre dynamique
  const dateRef   = useRef();          // date dynamique
  const bodyRef   = useRef();          // corps du texte (non utilisé ici)
  const scroll    = useScroll();
  const { width, height } = useThree((s) => s.viewport);
  const { slides } = useSnapshot(state);
  const titleYOffset = 0.3; // in world units.
  const dateYOffset = 1.25; // in world units.
  const ticksYOffset = 1; // in world units.
  const bodyYOffset = 0.1;

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

    /* — maj du body — */
    const newBody = slides[idx].body;
    if (bodyRef.current.text !== newBody) bodyRef.current.text = newBody;

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
            -height / 2 + ticksYOffset + bottomGap,
            0
          ]}
          userData={{ isTick: true, idx: i }}
        />
      ))}

      {/* titre dynamique (au-dessus de la barre) */}
      <Text
        ref={titleRef}
        position={[0, -height / 2 + titleYOffset + bottomGap, 0]}
        fontSize={0.22}
        maxWidth={titreMaxWidth}  /* max width for the title */
        textAlign='center'
        anchorX="center"
        anchorY="bottom"
        color="#ffffff"
      >
        {slides[0].title}
      </Text>

      <Text
        ref={bodyRef}
        position={[0, -height / 2 + bodyYOffset + bottomGap, 0]}
        fontSize={0.15}
        maxWidth={titreMaxWidth}  /* max width for the title */
        textAlign='left'
        anchorX="center"
        anchorY="top"
        color="#ffffff"
      >
        {slides[0].body}
      </Text>

      {/* date dynamique (plus petite, un peu plus bas) */}
      <Text
        ref={dateRef}
        position={[0, -height / 2 + dateYOffset + bottomGap, 0]}
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
  const click = () => {
    const refWidthBefore = ref.current.width; // save width before scroll
    console.log({ index, windowWidth: window.innerWidth, slidesLength: slides.length, scroll, position });
    state.clicked = index === clicked ? null : index;
    const maxPx    = scroll.el.scrollWidth - scroll.el.clientWidth;
    const ratio    = index / (slides.length - 1);  // 0 → 1

    scroll.el.scrollTo({ left: ratio * maxPx, behavior: 'smooth' });
  };
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

function Items({ w = 1, gap = 0.2 }) {
  const { width } = useThree((s) => s.viewport);
  const xW = w + gap;

  return (
    <ScrollControls horizontal damping={0.1} pages={(width - xW + state.slides.length * xW) / width}>
      <AutoCloseWhenStable xW={xW} />
      <Minimap />
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
