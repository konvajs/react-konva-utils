import Konva from "konva";
import React from "react";
import { Group, Layer, Rect, Stage, Transformer } from "react-konva";
import { Html } from "../html";
import { Scene } from "./Scene";

export default {
	title: "Html",
	component: Html,
};

export const Default = () => (
	<Scene>
		<Group draggable>
			<Rect width={100} height={100} fill="red" />
			<Html divProps={{ style: { border: "1px solid grey" } }}>
				Hello, world
			</Html>
		</Group>
	</Scene>
);
// HtmlSt.storyName = 'Default';

export const NoAutoTransform = () => (
	<Scene>
		<Group draggable>
			<Rect width={100} height={100} fill="red" />
			<Html transform={false}>Hello, world</Html>
		</Group>
	</Scene>
);
// HtmlStNoTransform.storyName = 'No transform';

export const Transforming = () => {
	const groupRef = React.useRef();
	const trRef = React.useRef();

	React.useLayoutEffect(() => {
		trRef.current.nodes([groupRef.current]);
	});
	return (
		<Scene>
			<Group draggable ref={groupRef} x={60} y={60}>
				<Rect width={100} height={100} fill="red" />
				<Html>Hello, world</Html>
			</Group>
			<Transformer ref={trRef} />
		</Scene>
	);
};

export const CalculatedTransforming = () => {
	const groupRef = React.useRef();
	const trRef = React.useRef();

	React.useLayoutEffect(() => {
		trRef.current.nodes([groupRef.current]);
	});

	return (
		<Scene>
			<Group draggable ref={groupRef} x={60} y={60}>
				<Rect width={100} height={100} fill="red" />
				<Html transformFunc={(attrs) => ({ ...attrs, rotation: 0 })}>
					Hello, world
				</Html>
			</Group>
			<Transformer ref={trRef} />
		</Scene>
	);
};

export const CalculatedTransformingChanging = () => {
	const groupRef = React.useRef();
	const trRef = React.useRef();

	const [rotation, setRotation] = React.useState(0);

	React.useLayoutEffect(() => {
		trRef.current.nodes([groupRef.current]);
	});

	React.useEffect(() => {
		const interval = setInterval(() => {
			setRotation((r) => r + 1);
		}, 100);

		return () => clearInterval(interval);
	});

	return (
		<Scene>
			<Group draggable ref={groupRef} x={60} y={60}>
				<Rect width={100} height={100} fill="red" />
				<Html transformFunc={(attrs) => ({ ...attrs, rotation: rotation })}>
					Hello, world
				</Html>
			</Group>
			<Transformer ref={trRef} />
		</Scene>
	);
};

export const ChangeProps = () => {
	const [style, setStyle] = React.useState({ border: "" });
	const [transform, setTransform] = React.useState(false);

	return (
		<Scene>
			<Group draggable x={60} y={60}>
				<Rect width={100} height={100} fill="red" />
				<Html transform={false}>
					<button
						onClick={() => {
							if (style.border) {
								setStyle({ border: "" });
							} else {
								setStyle({ border: "1px solid black" });
							}
						}}
					>
						toggle style
					</button>
					<button
						onClick={() => {
							setTransform(!transform);
						}}
					>
						toggle transform
					</button>
				</Html>
				<Html divProps={{ style }} transform={transform}>
					Hello, world
				</Html>
			</Group>
		</Scene>
	);
};

const TestContext = React.createContext({ color: "red" });

const HtmlInternal = () => {
	const data = React.useContext(TestContext);
	return (
		<div>
			<div style={{ color: data.color }}>Hello, world, I should be green.</div>
		</div>
	);
};

export const PassContext = () => {
	return (
		<TestContext.Provider value={{ color: "green" }}>
			<Scene>
				<Html>
					<HtmlInternal />
				</Html>
			</Scene>
		</TestContext.Provider>
	);
};

export const TwoLayersWithTween = () => {
	const topLayerRef = React.useRef<Konva.Layer>(null);
	const [isVisible, setIsVisible] = React.useState(true);

	const toggleOpacity = () => {
		if (topLayerRef.current) {
			const targetOpacity = isVisible ? 0 : 1;

			new Konva.Tween({
				node: topLayerRef.current,
				duration: 1,
				opacity: targetOpacity,
			}).play();

			setIsVisible(!isVisible);
		}
	};

	return (
		<div>
			<button
				type="button"
				onClick={toggleOpacity}
				style={{
					marginBottom: "10px",
					padding: "8px 16px",
					cursor: "pointer",
				}}
			>
				Toggle Top Layer Opacity
			</button>
			<Stage width={500} height={400}>
				<Layer>
					<Group x={50} y={50}>
						<Rect width={150} height={150} fill="blue" />
						<Html>
							<div
								style={{
									padding: "10px",
									background: "lightblue",
									border: "2px solid blue",
									borderRadius: "4px",
								}}
							>
								Bottom Layer HTML
							</div>
						</Html>
					</Group>
				</Layer>
				<Layer ref={topLayerRef}>
					<Group x={100} y={100}>
						<Rect width={150} height={150} fill="red" />
						<Html>
							<div
								style={{
									padding: "10px",
									background: "lightcoral",
									border: "2px solid red",
									borderRadius: "4px",
								}}
							>
								Top Layer HTML
							</div>
						</Html>
					</Group>
				</Layer>
			</Stage>
		</div>
	);
};
