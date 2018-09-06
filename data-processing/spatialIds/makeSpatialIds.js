const SpatialIdsClass = require('./SpatialIdsClass.js');

const spatialIdsStore = new SpatialIdsClass();

spatialIdsStore.on('districtsToSkipCalculated', spatialIdsStore.makeToDos);
spatialIdsStore.on('toDosCompleted', spatialIdsStore.makePreliminaryMapping);
spatialIdsStore.on('preliminaryMappingCompleted', spatialIdsStore.makeCandidates);
spatialIdsStore.on('candidatesCompleted', spatialIdsStore.selectCandidates);
spatialIdsStore.on('candidateSelectionCompleted', spatialIdsStore.assignSpatialIds);
spatialIdsStore.on('spatialIdsAssigned', spatialIdsStore.adjustForAtLarge);
//spatialIdsStore.on('atLargeCompleted', spatialIdsStore.makeLookup);
spatialIdsStore.on('atLargeCompleted', spatialIdsStore.makeLookup);
spatialIdsStore.on('finished', () => console.log('fin'));

spatialIdsStore.adjustForAtLarge();
//spatialIdsStore.makeALDistrictsToIgnore();
