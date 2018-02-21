module.exports = function(resultData, callback) {
    callback(generateJson(resultData));
};

function generateJson(nodeData){

    var chartNode = processCity("location_as_per_bluepages",nodeData);

    return {
        "name" : " ",
        "children" : chartNode
    }

}

function processCity( key , rawData) {
    var cityNode = processNode(key, rawData);
    cityNode.forEach(function (cityInstace) {
        cityInstace.children = processProjectName("project_name",cityInstace.children)
    });
    return cityNode;
}

function processProjectName(key, projectData) {
    var projectNode = processNode(key, projectData);
    projectNode.forEach(function (projectInstace) {
        projectInstace.children = processSkill("job_role_skill_set",projectInstace.children)
    })
    return projectNode;
}

function processSkill(key, skillsData) {
    var skillsNode = processNode(key, skillsData);
    skillsNode.forEach(function (skillsInstace) {
        skillsInstace.children = processBand("band",skillsInstace.children)
    });
    return skillsNode;
}

function processBand (key, bandData) {
    var bandNode = processNode(key, bandData);
    bandNode.forEach(function (bandInstace) {
        bandInstace.children = processRollingStatus("roll_off_bracket", bandInstace.children)
    });
    return bandNode;
}

function processRollingStatus (key, rollingStatusData) {
    var statusNode = processNode(key, rollingStatusData);
    statusNode.forEach(function (rollingInstace) {
        rollingInstace.children = processEMPNotes("emp_notesid", rollingInstace.children)
    });
    return statusNode;
}

function processEMPNotes(key, EmpData) {
    var empNode = processNode(key, EmpData);
    empNode.forEach(function (empInstace) {
        empInstace.children = processYTDUtil("ytd_prod_utilization_range", empInstace.children)
    });
    return empNode;
}

function processYTDUtil(key, UtilData) {
    var UtilNode = processNode(key, UtilData);
    // empNode.forEach(function (empInstace) {
    //     empInstace.children = processRollingStatus("emp_notesid", empInstace.children)
    // });
    return UtilNode;
}

function processNode( key, rawData) {
    var resultNode = {};
    var expectedResult = [];
    rawData.forEach(function (keyNode) {
        resultNode[keyNode[key]] = {
            "name" : keyNode[key].toUpperCase(),
            "class" : key.toUpperCase(),
            "children" : []
        };
    });
    rawData.forEach(function (childNode) {
         if( !(key === "ytd_prod_utilization_range")){
         resultNode[childNode[key]].children.push(childNode);
         }else {
         // delete resultNode[childNode[key]]['children'];
         resultNode[childNode[key]]["size"] = 1;
         resultNode[childNode[key]]["color"] = childNode['location_as_per_bluepages'];
         resultNode[childNode[key]]["label"] = null;
         }
    });
    for(var index in resultNode){
        expectedResult.push(resultNode[index]);
    }
    return expectedResult;
}