
const express = require( 'express' );
const localtunnel = require( 'localtunnel' );
const path = require( 'path' );

const server = express();

server.use( express.static( __dirname + '/public' ) );
server.use( '/build/', express.static( path.join( __dirname, 'node_modules/three/build' ) ) );
server.use( '/jsm/', express.static( path.join( __dirname, 'node_modules/three/examples/jsm' ) ) );

/////////////////////////////////////////////////////////

let port = 8080;
if( process.argv.length > 2 )	{
	port = process.argv[ 2 ];
}

let listener = server.listen(
	port,
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

let tunneller = localtunnel(
	{
		port: port
	},
	( err, tunnel ) => {

		console.log( " ┌───────────────────────────────────┐" );
		console.log( " │                                   │" );
		console.log( " │   Tunnel Server:                  │" );
		console.log( " │                                   │" );
		console.log( " │       " + tunnel.url );
		console.log( " │                                   │" );
		console.log( " └───────────────────────────────────┘" );
	}
);

