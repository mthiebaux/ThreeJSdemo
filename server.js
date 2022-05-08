
const express = require( 'express' );
const path = require( 'path' );

const server = express();
let port = 8080;

/////////////////////////////////////////////////////////

server.use( express.static( __dirname + '/public' ) );
server.use( '/build/', express.static( path.join( __dirname, 'node_modules/three/build' ) ) );
server.use( '/jsm/', express.static( path.join( __dirname, 'node_modules/three/examples/jsm' ) ) );

/////////////////////////////////////////////////////////

function get_port_input_value()	{

	if( process.argv.length > 2 )	{
		port = process.argv[ 2 ];
	}
	return( port );
}

server.listen(
	get_port_input_value(),
	() => {
		console.log( " ┌───────────────────────────────────┐" );
		console.log( " │                                   │" );
		console.log( " │   Express Server:                 │" );
		console.log( " │                                   │" );
		console.log( " │       http://localhost:" + port + "       │" );
		console.log( " │                                   │" );
		console.log( " └───────────────────────────────────┘" );
	}
);
