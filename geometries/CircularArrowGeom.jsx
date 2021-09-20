import * as THREE from 'three';
import { mergeBufferGeometries } from './MergeGeometries';

// position is the radius of the circle this is a piece of
export function circularArrowGeom({
    angle,
    meshRadius = 0.1,
    x = 3.5,
    y = -7.5,
    reversed = false
}) {
    const tipLength = 0.6;
    const arrowAngle = Math.PI / 4;

    const vec = new THREE.Vector2(x, y);
    const radius = vec.length();
    const vecAngle = vec.angle();

    const torusGeom = new THREE.TorusBufferGeometry(radius, meshRadius, 64, 64, angle);

    const tipGeom1 = new THREE.CylinderBufferGeometry(meshRadius, meshRadius, tipLength)
        .translate(0, -tipLength / 2, 0)
        .rotateZ(-arrowAngle / 2);
    const tipGeom2 = new THREE.CylinderBufferGeometry(meshRadius, meshRadius, tipLength)
        .translate(0, -tipLength / 2, 0)
        .rotateZ(arrowAngle / 2);
    const tipGeom = mergeBufferGeometries([tipGeom1, tipGeom2]);

    let epsilon = 0;
    if (reversed) {
        tipGeom.rotateZ(Math.PI);
        epsilon = 0.1;
    }
    tipGeom
        .translate(0, tipLength / 2, 0)
        .rotateZ(angle / 2)
        .translate(
            radius * Math.cos(angle / 2 - epsilon),
            radius * Math.sin(angle / 2 - epsilon),
            0
        );

    const geom = mergeBufferGeometries([torusGeom, tipGeom]);

    geom.rotateZ(vecAngle);

    //const sphereGeom = new THREE.SphereBufferGeometry( .5 );
    //sphereGeom.translate( position*Math.cos( angle/2), position*Math.sin(angle/2), 0);

    return geom; //mergeBufferGeometries([torusGeom, tipGeom]);
}
