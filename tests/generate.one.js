const { Generator } = require("../index");

const generator = new Generator()

generator.generateType('https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Map.html')
    .then((res) => {
        console.log(res);
    })

