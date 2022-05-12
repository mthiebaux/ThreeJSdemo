
import * as THREE from 'three';
import Stats from './jsm/libs/stats.module.js';
import { GUI } from './jsm/libs/lil-gui.module.min.js';

import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { TransformControls } from './jsm/controls/TransformControls.js';

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

const stats = Stats();
//document.body.appendChild( stats.domElement );

const gui_menu = new GUI();
gui_menu.close();

////////////////////////////////////////////////////////////////////////////////
// COLORS FOR LIGHTING

const col_rear = 0x554433;
const col_spot = 0xfff7aa;
const col_sky = 0x7f8f9f;
const col_ground = 0x241f1d; // for hemisphere light

///////////////////

const renderer = new THREE.WebGLRenderer(
	{
		alpha: true,
		antialias: true
	}
);
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setClearColor( col_sky );
renderer.shadowMap.enabled = true;

/*
// unable to change these on the fly:
	THREE.BasicShadowMap
	THREE.PCFShadowMap (default)
	THREE.PCFSoftShadowMap
	THREE.VSMShadowMap
*/
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild( renderer.domElement );

///////////////////

let fov = 75.0;
let aspect = window.innerWidth / window.innerHeight;
let near = 0.1;
let far = 1000.0;
const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
camera.position.x = -3.5;
camera.position.y = 2.0;
camera.position.z = 3.0;

const cameraFolder = gui_menu.addFolder( 'Camera' );
cameraFolder.add( camera.position, 'z', 0.0, 10.0 );
cameraFolder.close();

const scene = new THREE.Scene();
//scene.background = new THREE.Color( 0x000022 ); // set by renderer

///////////////////

const cam_controls = new OrbitControls( camera, renderer.domElement );
cam_controls.enabled = true;

const obj_controls = new TransformControls( camera, renderer.domElement );
obj_controls.setMode( 'rotate' );
obj_controls.setSpace( 'local' );
obj_controls.enabled = true;
scene.add( obj_controls );

////////////////////////////////////////////////////////////////////////////////

const hemiLight = new THREE.HemisphereLight( col_sky, col_ground, 1.0 );

// Override orientation:
// hemiLight.position.x = 1.0;
// hemiLight.position.y = 0.0;
// hemiLight.position.z = 0.0;

scene.add( hemiLight );

///////////////////

let shadow_resolution = 1024;
let shadow_radius = 4.0; // no effect with PCFSoftShadowMap
let shadow_bias = 0.00001;

// dirLight.shadow.blurSamples : Integer... The amount of samples to use when blurring a VSM shadow map.
// dirLight.normalBias : Float... The default is 0. Increasing this value can be used to reduce shadow acne

const dirLight = new THREE.DirectionalLight( col_rear, 1 );
dirLight.position.set( -2.0, 5.0, -10.0 );
dirLight.target.position.set( 0.0, 0.0, 0.0 );
dirLight.castShadow = true;
dirLight.shadow.radius = shadow_radius;
dirLight.shadow.bias = shadow_bias;
dirLight.shadow.mapSize.width = shadow_resolution;
dirLight.shadow.mapSize.height = shadow_resolution;
dirLight.shadow.camera.near = 5.0;
dirLight.shadow.camera.far = 18.0;
dirLight.shadow.camera.left = -5.0;
dirLight.shadow.camera.right = 5.0;
dirLight.shadow.camera.bottom = -5.0;
dirLight.shadow.camera.top = 5.0;
scene.add( dirLight );

const dlh_radius = 1.0;
const dir_light_helper = new THREE.DirectionalLightHelper( dirLight, dlh_radius, 0xffffff );
dir_light_helper.visible = false;
scene.add( dir_light_helper );

const dir_shadow_helper = new THREE.CameraHelper( dirLight.shadow.camera );
dir_shadow_helper.visible = false;
scene.add( dir_shadow_helper );

///////////////////

let spot_intensity = 2.0;
let spot_distance = 15.0;
let spot_angle = Math.PI / 8.0;
let spot_penumbra = 0.25;
let spot_decay = 1.0;

const spotLight = new THREE.SpotLight(
	col_spot,
	spot_intensity, spot_distance,
	spot_angle, spot_penumbra, spot_decay
);
spotLight.position.set( 4.0, 6.0, 5.0 );
spotLight.target.position.set( 0.0, 0.0, 0.0 );
spotLight.castShadow = true;
spotLight.shadow.radius = shadow_radius;
spotLight.shadow.bias = shadow_bias;
spotLight.shadow.mapSize.width = shadow_resolution;
spotLight.shadow.mapSize.height = shadow_resolution;
spotLight.shadow.camera.near = 4.0;
spotLight.shadow.camera.far = 15.0;
spotLight.shadow.camera.fov = 45.0;
scene.add( spotLight );

const spot_light_helper = new THREE.SpotLightHelper( spotLight );
spot_light_helper.visible = false;
scene.add( spot_light_helper );

const spot_shadow_helper = new THREE.CameraHelper( spotLight.shadow.camera );
spot_shadow_helper.visible = false;
scene.add( spot_shadow_helper );

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// GROUND PLANE BACKGROUND:

const plane = new THREE.Mesh(
	new THREE.PlaneGeometry( 10.0, 10.0, 10, 10 ),
	new THREE.MeshStandardMaterial( { color: 0x555555 } )
);
plane.receiveShadow = true;
plane.translateY( -1.01 );
plane.rotateX( -Math.PI / 2.0 );
scene.add( plane );

const undergrid = new THREE.Mesh(
	new THREE.PlaneGeometry( 10.0, 10.0, 10, 10 ),
	new THREE.MeshBasicMaterial(
		{
			color: 0x000000,
			wireframe: true
		}
	)
);
undergrid.translateY( -1.001 );
undergrid.rotateX( -Math.PI / 2.0 );
scene.add( undergrid );

const outergrid = new THREE.Mesh(
	new THREE.PlaneGeometry( 50.0, 50.0, 5, 5 ),
	new THREE.MeshBasicMaterial(
		{
			color: 0x555555,
			wireframe: true
		}
	)
);
outergrid.translateY( -1.0 );
outergrid.rotateX( -Math.PI / 2.0 );
scene.add( outergrid );

const outerplane = new THREE.Mesh(
	new THREE.CircleGeometry( 500.0, 32 ),
	new THREE.MeshBasicMaterial(
		{
			color: 0x000000
		}
	)
);
outerplane.translateY( -1.02 );
outerplane.rotateX( -Math.PI / 2.0 );
scene.add( outerplane );

const outerground = new THREE.Mesh(
	new THREE.CylinderGeometry( 500.0, 500.0, 1000.0, 8, 1, true ),
	new THREE.MeshPhongMaterial(
		{
			color: 0x000000,
			side: THREE.BackSide
		}
	)
);
outerground.translateY( -501.2 );
scene.add( outerground );

///////////////////
// OBJECTS TO MANIPULATE:

const pickable_targets = [];

const cube = new THREE.Mesh(
	new THREE.BoxGeometry( 2.0, 2.0, 2.0 ),
	new THREE.MeshStandardMaterial( { color: 0xffffff } )
);
// cube.name = "my cube!"; // scene.getObjectByName( "" );
cube.castShadow = true;
cube.receiveShadow = true;
cube.add( new THREE.AxesHelper( 3.0 ) );
scene.add( cube );
pickable_targets.push( cube );

const cylinder = new THREE.Mesh(
	new THREE.CylinderGeometry( 0.75, 0.75, 2.0, 512, 1 ),
	new THREE.MeshPhongMaterial(
		{
			color: 0xffffff,
			specular: 0xffffff, // dfl 0x111111
			shininess: 2048, 	// dfl 30
			flatShading: true
		}
	)
);
cylinder.castShadow = true;
cylinder.receiveShadow = true;
cylinder.translateX( -1.5 );
cylinder.translateZ( -2.0 );
scene.add( cylinder );
pickable_targets.push( cylinder );

const ball_res = 12;

const ball = new THREE.Mesh(
	new THREE.IcosahedronGeometry( 1.0, ball_res ),
	new THREE.MeshPhongMaterial(
		{
			color: 0xffffff,
			specular: 0x7f7f7f, // dfl 0x111111
			shininess: 8, 	// dfl 30
			flatShading: true
		}
	)
);
ball.castShadow = true;
ball.receiveShadow = true;
ball.translateX( 1.25 );
ball.translateY( 0.75 );
ball.translateZ( 1.0 );
scene.add( ball );
pickable_targets.push( ball );

////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////// ////////////////////////////////////////

const raycaster = new THREE.Raycaster();
let picked_object = null;

function get_picked_object()	{

	let hit_obj = null;
	let hit_dist = Number.MAX_SAFE_INTEGER;

	const point = new THREE.Vector2(
		( event.clientX / window.innerWidth ) * 2 - 1,
		- ( event.clientY / window.innerHeight ) * 2 + 1
	);

	raycaster.setFromCamera( point, camera );
	const intersects = raycaster.intersectObjects( scene.children );

	for ( let i = 0; i < intersects.length; i ++ ) {

		if( pickable_targets.includes( intersects[ i ].object ) )	{

			if( intersects[ i ].distance < hit_dist )	{

				hit_dist = intersects[ i ].distance;
				hit_obj = intersects[ i ].object;

			}
		}
	}
	return( hit_obj );
}

////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////// ////////////////////////////////////////

window.addEventListener(
	'mousedown',
	function( event )	{

		let pick = get_picked_object();
		if( pick !== null )	{
			if( pick !== picked_object )	{

				picked_object = pick;
				obj_controls.attach( picked_object );
			}
			cam_controls.enabled = false;
		}
		else	{

			picked_object = null;
			obj_controls.detach();
			cam_controls.enabled = true;
		}
	}
);

window.addEventListener(
    'resize',
    () => {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

        renderer.render( scene, camera );
    },
    false
);

window.addEventListener(
	'keydown',
	function( event ) {

		switch( event.code ) {

			case 'KeyT':

				obj_controls.setMode( 'translate' );
				break;

			case 'KeyR':

				obj_controls.setMode( 'rotate' );
				break;

			case 'KeyS':

				obj_controls.setMode( 'scale' );
				break;

			case 'KeyW':

				if( obj_controls.space === 'world' )	{
					obj_controls.setSpace( 'local' );
				}
				else	{
					obj_controls.setSpace( 'world' );
				}
				break;

			case 'KeyL':

				if( dir_shadow_helper.visible )	{
					dir_shadow_helper.visible = false;
					spot_shadow_helper.visible = true;
				}
				else
				if( spot_shadow_helper.visible )	{
					dir_shadow_helper.visible = false;
					spot_shadow_helper.visible = false;
				}
				else	{
					dir_shadow_helper.visible = true;
					spot_shadow_helper.visible = false;
				}
				break;

/*
// these on-the-fly changes to the shadow algorithm do not work, something missing?
			case 'Digit1':

// done when changing resolution:
	dirLight.shadow.map.dispose(); // important
	dirLight.shadow.map = null;
	spotLight.shadow.map.dispose();
	spotLight.shadow.map = null;

				renderer.shadowMap.type = THREE.BasicShadowMap;

				renderer.shadowMap.needsUpdate = true;
				renderer.state.reset();
				break;

			case 'Digit2':

	dirLight.shadow.map.dispose(); // important
	dirLight.shadow.map = null;
	spotLight.shadow.map.dispose();
	spotLight.shadow.map = null;

				renderer.shadowMap.type = THREE.PCFShadowMap;
				renderer.shadowMap.needsUpdate = true;
				renderer.state.reset();
				break;

			case 'Digit3':

				renderer.shadowMap.type = THREE.PCFSoftShadowMap;
				renderer.shadowMap.needsUpdate = true;
				renderer.state.reset();
				break;

			case 'Digit4':

				renderer.shadowMap.type = THREE.VSMShadowMap;
				renderer.state.reset();
				break;
*/
		}
	}
);

//////////////////////////////////////// ////////////////////////////////////////
//////////////////////////////////////// ////////////////////////////////////////

function set_text_overlay( html_string )	{

	var div = document.getElementById( "text_overlay" );
	div.innerHTML = html_string;
}
set_text_overlay( "text<br> overlay" );

function animation_frame_function() {

    stats.update();

    cam_controls.update();

    renderer.render( scene, camera );

    requestAnimationFrame( animation_frame_function );
}

animation_frame_function();


