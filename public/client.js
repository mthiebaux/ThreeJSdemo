
import * as THREE from 'three';
import Stats from './jsm/libs/stats.module.js';
import { GUI } from './jsm/libs/lil-gui.module.min.js';

import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { TransformControls } from './jsm/controls/TransformControls.js';

//import { RectAreaLightHelper }  from `./jsm/helpers/RectAreaLightHelper.js`;

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// COLORS FOR LIGHTING
const col_rear = 0x554433;
const col_spot = 0xfff7aa;
const col_sky = 0x7f8f9f;
const col_ground = 0x241f1d; // for hemisphere light

///////////////////

const stats = Stats();
//document.body.appendChild( stats.domElement );

const gui_menu = new GUI();
gui_menu.close();

////////////////////////////////////////////////////////////////////////////////

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

let fov = 60.0;
let aspect = window.innerWidth / window.innerHeight;
let near = 0.1;
let far = 1000.0;
const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
camera.position.fromArray( [ -3.5, 2.0, 3.0 ] );

const cameraFolder = gui_menu.addFolder( 'Camera' );
cameraFolder.add( camera.position, 'z', 0.0, 10.0 ).onChange( on_camera_view_change );
cameraFolder.add( camera, 'fov', 1.0, 120.0 ).onChange( on_camera_view_change );
//cameraFolder.close();

const cam_controls = new OrbitControls( camera, renderer.domElement );
cam_controls.enabled = true;
cam_controls.addEventListener( 'change', on_camera_view_change );

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

let curr_picked_object = null;

function d2r( deg ) { return( deg * 0.017453292519943 ); }
function r2d( rad ) { return( rad * 57.295779513082321 ); }

function on_gizmo_xform_change()	{

	if( curr_picked_object )	{

		let dist = camera.position.distanceTo( curr_picked_object.position );

		let h = Math.tan( d2r( camera.fov ) * 0.5 ) * dist;

		let ctrl_size = 2.5 / h;

		obj_controls.setSize( ctrl_size );
	}
}

function on_camera_view_change()	{

	on_gizmo_xform_change();

	camera.updateProjectionMatrix();
}

////////////////////////////////////////////////////////////////////////////////

const scene = new THREE.Scene();
//scene.background = new THREE.Color( 0x000022 ); // set by renderer

///////////////////

const obj_controls = new TransformControls( camera, renderer.domElement );
obj_controls.setMode( 'rotate' );
obj_controls.setSpace( 'local' );
obj_controls.enabled = true;
obj_controls.addEventListener( 'change', on_gizmo_xform_change );
scene.add( obj_controls );

////////////////////////////////////////////////////////////////////////////////

if( 0 )	{
	const hemiLight = new THREE.HemisphereLight( 0x5fafff, col_ground, 1.0 );
	hemiLight.position.x = 0.0;
	hemiLight.position.y = 0.5;
	hemiLight.position.z = -1.0;
}
else
if( 1 )	{
	const hemiLight = new THREE.HemisphereLight( col_sky, col_ground, 1.0 );
	scene.add( hemiLight );
}

///////////////////

let shadow_resolution = 1024;
let shadow_radius = 4.0; // no effect with PCFSoftShadowMap
let shadow_bias = 0.00001;

// dirLight.shadow.blurSamples : Integer... The amount of samples to use when blurring a VSM shadow map.
// dirLight.normalBias : Float... The default is 0. Increasing this value can be used to reduce shadow acne

let dir_shadow_helper = null;

if( 1 )	{

//	const dirLight = new THREE.DirectionalLight( 0xffcf1f, 1 );
	const dirLight = new THREE.DirectionalLight( col_rear, 1 );

	dirLight.position.set( -2.0, 4.5, -10.0 );
	dirLight.target.position.set( 0.0, 0.0, 0.0 );
	dirLight.castShadow = true;
	dirLight.shadow.radius = shadow_radius;
	dirLight.shadow.bias = shadow_bias;
	dirLight.shadow.mapSize.width = shadow_resolution;
	dirLight.shadow.mapSize.height = shadow_resolution;
	dirLight.shadow.camera.near = 2.0;
	dirLight.shadow.camera.far = 18.0;
	dirLight.shadow.camera.left = -6.0;
	dirLight.shadow.camera.right = 6.0;
	dirLight.shadow.camera.bottom = -5.0;
	dirLight.shadow.camera.top = 5.0;
	scene.add( dirLight );

	const dlh_radius = 1.0;
	const dir_light_helper = new THREE.DirectionalLightHelper( dirLight, dlh_radius, 0xffffff );
	dir_light_helper.visible = false;
	scene.add( dir_light_helper );

	dir_shadow_helper = new THREE.CameraHelper( dirLight.shadow.camera );
	dir_shadow_helper.visible = false;
	scene.add( dir_shadow_helper );
}

///////////////////

let spot_shadow_helper = null;

if( 1 )	{
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

	spot_shadow_helper = new THREE.CameraHelper( spotLight.shadow.camera );
	spot_shadow_helper.visible = false;
	scene.add( spot_shadow_helper );
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// GROUND PLANE BACKGROUND:

if( 1 )	{
	const plane = new THREE.Mesh(
		new THREE.PlaneGeometry( 10.0, 10.0, 1, 1 ),
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
}

if( 1 )	{
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
}

////////////////////////////////////////////////////////////////////////////////
// EXPERIMENTAL WINDOW DAYLIGHT:

if( 0 )	{

	const intensity = 100.0;
	const rectLight = new THREE.RectAreaLight( 0x0000ff, intensity,  4.0, 4.0 );
	rectLight.position.set( 0.0, 3.0, -4.9 );
	rectLight.lookAt( 0.0, 3.0, 0.0 );
	scene.add( rectLight );

//	const rectLightHelper = new RectAreaLightHelper( rectLight );
//	rectLight.add( rectLightHelper );
}

if( 0 )	{
	const winmaskgeomA = new THREE.PlaneGeometry( 3.0, 8.0, 3, 8 );

	const winmask0 = new THREE.Mesh(
		winmaskgeomA,
		new THREE.MeshStandardMaterial( { color: 0xffffff, side: THREE.DoubleSide } )
	);
	winmask0.castShadow = true;
	winmask0.receiveShadow = true;
	winmask0.translateX( -3.5 );
	winmask0.translateY( 3.0 );
	winmask0.translateZ( -5.0 );
	scene.add( winmask0 );

	const winmaskwire0 = new THREE.Mesh(
		winmaskgeomA,
		new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } )
	);
	winmaskwire0.translateX( -3.5 );
	winmaskwire0.translateY( 3.0 );
	winmaskwire0.translateZ( -5.0 );
	scene.add( winmaskwire0 );

	const winmask1 = new THREE.Mesh(
		winmaskgeomA,
		new THREE.MeshStandardMaterial( { color: 0xffffff, side: THREE.DoubleSide } )
	);
	winmask1.castShadow = true;
	winmask1.receiveShadow = true;
	winmask1.translateX( 3.5 );
	winmask1.translateY( 3.0 );
	winmask1.translateZ( -5.0 );
	scene.add( winmask1 );

	const winmaskwire1 = new THREE.Mesh(
		winmaskgeomA,
		new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } )
	);
	winmaskwire1.translateX( 3.5 );
	winmaskwire1.translateY( 3.0 );
	winmaskwire1.translateZ( -5.0 );
	scene.add( winmaskwire1 );

	const winmaskgeomB = new THREE.PlaneGeometry( 4.0, 2.0, 4, 2 );

	const winmask2 = new THREE.Mesh(
		winmaskgeomB,
		new THREE.MeshStandardMaterial( { color: 0xffffff, side: THREE.DoubleSide } )
	);
	winmask2.castShadow = true;
	winmask2.receiveShadow = true;
	//winmask2.translateX( -3.5 );
	//winmask2.translateY( 3.0 );
	winmask2.translateZ( -5.0 );
	scene.add( winmask2 );

	const winmaskwire2 = new THREE.Mesh(
		winmaskgeomB,
		new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } )
	);
	//winmaskwire2.translateX( -3.5 );
	//winmaskwire2.translateY( 3.0 );
	winmaskwire2.translateZ( -5.0 );
	scene.add( winmaskwire2 );

	const winmask3 = new THREE.Mesh(
		winmaskgeomB,
		new THREE.MeshStandardMaterial( { color: 0xffffff, side: THREE.DoubleSide } )
	);
	winmask3.castShadow = true;
	winmask3.receiveShadow = true;
	winmask3.translateY( 6.0 );
	winmask3.translateZ( -5.0 );
	scene.add( winmask3 );

	const winmaskwire3 = new THREE.Mesh(
		winmaskgeomB,
		new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } )
	);
	winmaskwire3.translateY( 6.0 );
	winmaskwire3.translateZ( -5.0 );
	scene.add( winmaskwire3 );
}

////////////////////////////////////////////////////////////////////////////////
// OBJECTS TO MANIPULATE:

const pickable_targets = [];

if( 1 )	{
	const cube = new THREE.Mesh(
		new THREE.BoxGeometry( 2.0, 2.0, 2.0 ),
		new THREE.MeshStandardMaterial(
			{
				color: 0xffffff,
				roughness: 1.0,
				flatShading: true
			}
		)
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
}

////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////// ////////////////////////////////////////

const raycaster = new THREE.Raycaster();

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
			if( pick !== curr_picked_object )	{

				curr_picked_object = pick;
				obj_controls.attach( curr_picked_object );
			}
			cam_controls.enabled = false;
		}
		else	{

			curr_picked_object = null;
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

				if( dir_shadow_helper && spot_shadow_helper )	{
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


