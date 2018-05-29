function Isosurfaces( volume, isovalue )
{
    var geometry = new THREE.Geometry();
    var material = new THREE.MeshBasicMaterial();
    material.side = THREE.DoubleSide;

    var smin = volume.min_value;
    var smax = volume.max_value;
    isovalue = KVS.Clamp( isovalue, smin, smax );  //isovalueの値を範囲内に留める

    var lut = new KVS.MarchingCubesTable();
    var cell_index = 0;
    var counter = 0;

    var normal = new THREE.Vector3( 3, 4 ,5 ); //normal vector
    var point = new THREE.Vector3( volume.resolution.x * 0.5, volume.resolution.y * 0.5, volume.resolution.z * 0.5 );

    // Create color map
    var cmap = [];
    for ( var i = 0; i < 256; i++ )
    {
	var S = i / 255.0; // [0,1]
	var R = Math.max( Math.cos( ( S - 1.0 ) * Math.PI ), 0.0 );
	var G = Math.max( Math.cos( ( S - 0.5 ) * Math.PI ), 0.0 );
	var B = Math.max( Math.cos( S * Math.PI ), 0.0 );
	var color = new THREE.Color( R, G, B );
	cmap.push( [ S, '0x' + color.getHexString() ] );
    }

    var i = 0;
    for ( var z = 0; z < volume.resolution.z - 1; z++ )
    {
	for ( var y = 0; y < volume.resolution.y - 1; y++ )
	{
	    for ( var x = 0; x < volume.resolution.x - 1; x++ )
	    {
		var coordinates = cell_node_coordinates( x, y, z );
		var index = table_index( coordinates, normal, point ); 
		if ( index == 0 ) { continue; }
		if ( index == 255 ) { continue; }

		for ( var j = 0; lut.edgeID[index][j] != -1; j += 3 )
		{
		    var eid0 = lut.edgeID[index][j];  //マーチングキューブ法により等値面と交差する辺のIDを算出
		    var eid1 = lut.edgeID[index][j+2];
		    var eid2 = lut.edgeID[index][j+1];

		    var vid0 = lut.vertexID[eid0][0];  //辺のIDから辺を構成する点のIDを算出
		    var vid1 = lut.vertexID[eid0][1];
		    var vid2 = lut.vertexID[eid1][0];
		    var vid3 = lut.vertexID[eid1][1];
		    var vid4 = lut.vertexID[eid2][0];
		    var vid5 = lut.vertexID[eid2][1];

		    var v0 = new THREE.Vector3( x + vid0[0], y + vid0[1], z + vid0[2] );  //xyz座標面にセルを落とす
		    var v1 = new THREE.Vector3( x + vid1[0], y + vid1[1], z + vid1[2] );
		    var v2 = new THREE.Vector3( x + vid2[0], y + vid2[1], z + vid2[2] );
		    var v3 = new THREE.Vector3( x + vid3[0], y + vid3[1], z + vid3[2] );
		    var v4 = new THREE.Vector3( x + vid4[0], y + vid4[1], z + vid4[2] );
		    var v5 = new THREE.Vector3( x + vid5[0], y + vid5[1], z + vid5[2] );

		    var v01 = interpolated_vertex( v0, v1, normal, point );
		    var v23 = interpolated_vertex( v2, v3, normal, point );
		    var v45 = interpolated_vertex( v4, v5, normal, point );

		    geometry.vertices.push( v01[0] );
		    geometry.vertices.push( v23[0] );
		    geometry.vertices.push( v45[0] );

		    var id0 = counter++;
		    var id1 = counter++;
		    var id2 = counter++;

		    var face = new THREE.Face3( id0, id1, id2 );
		    geometry.faces.push( face );
		    var c0 = new THREE.Color().setHex( cmap[ v01[1] ][1] );
		    var c1 = new THREE.Color().setHex( cmap[ v23[1] ][1] );
		    var c2 = new THREE.Color().setHex( cmap[ v45[1] ][1] );
		    geometry.faces[i].vertexColors.push( c0 );
		    geometry.faces[i].vertexColors.push( c1 );
		    geometry.faces[i].vertexColors.push( c2 );
		    
		    i++;
		}
	    }
	    cell_index++;
	}
	cell_index += volume.resolution.x;
    }

    geometry.computeVertexNormals();

    material.vertexColors = THREE.VertexColors;

    return new THREE.Mesh( geometry, material );

    function cell_node_coordinates( x, y, z )
    {
	var co0 = new THREE.Vector3( x, y, z );		
	var co1 = new THREE.Vector3( x+1, y, z );
	var co2 = new THREE.Vector3( x+1, y+1, z );
	var co3 = new THREE.Vector3( x, y+1, z );
	var co4 = new THREE.Vector3( x, y, z+1 );
	var co5 = new THREE.Vector3( x+1, y, z+1 );
	var co6 = new THREE.Vector3( x+1, y+1, z+1 );
	var co7 = new THREE.Vector3( x, y+1, z+1 );

	return [ co0, co1, co2, co3, co4, co5, co6, co7 ];
    }

    function table_index( coordinates, normal, point )
    {
	var index = 0;
	if ( plane( coordinates[0], normal, point ) >= 0 ) { index |=   1; }
	if ( plane( coordinates[1], normal, point ) >= 0 ) { index |=   2; }
	if ( plane( coordinates[2], normal, point ) >= 0 ) { index |=   4; }
	if ( plane( coordinates[3], normal, point ) >= 0 ) { index |=   8; }
	if ( plane( coordinates[4], normal, point ) >= 0 ) { index |=  16; }
	if ( plane( coordinates[5], normal, point ) >= 0 ) { index |=  32; }
	if ( plane( coordinates[6], normal, point ) >= 0 ) { index |=  64; }
	if ( plane( coordinates[7], normal, point ) >= 0 ) { index |= 128; }

	return index;
    }

    function interpolated_vertex( v0, v1, normal, point )
    {
	var i0 = v0.x + v0.y * volume.resolution.x + v0.z * volume.resolution.x * volume.resolution.y;
	var i1 = v1.x + v1.y * volume.resolution.x + v1.z * volume.resolution.x * volume.resolution.y;
	var s0 = volume.values[i0][0];
	var s1 = volume.values[i1][0];

	var x0 = v0.x - point.x;
	var y0 = v0.y - point.y;
	var z0 = v0.z - point.z;

	if ( v0.x != v1.x ) {
	    var x = point.x - ( normal.y*y0 + normal.z*z0 ) / normal.x;
	    var t = ( x - v0.x ) / ( v1.x - v0.x );
	    var s = parseInt(s0 * t + s1 * (1-t));
	    var v = new THREE.Vector3( x, v0.y, v0.z );
	}
	if ( v0.y != v1.y ) {
	    var y = point.y - ( normal.x*x0 + normal.z*z0 ) / normal.y;
	    var t = ( y - v0.y ) / ( v1.y - v0.y );
	    var s = parseInt(s0 * t + s1 * (1-t));
	    var v =  new THREE.Vector3( v0.x, y, v0.z );
	}
	if ( v0.z != v1.z ) {
	    var z = point.z - ( normal.x*x0 + normal.y*y0 ) / normal.z;
	    var t = ( z - v0.z ) / ( v1.z - v0.z );
	    var s = parseInt(s0 * t + s1 * (1-t));
	    var v = new THREE.Vector3( v0.x, v0.y, z );
	}
	
	return [ v, s ];
    }

    function plane( co, normal, point )
    {
	var s = normal.x*( co.x - point.x )  + normal.y*( co.y - point.y ) + normal.z*( co.z - point.z );

	return s;
    }
}
