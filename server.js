// server.js
const express = require('express');
const soap = require('soap');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();
const port = 3000;

// Servir el archivo index.html
app.use(express.static(path.join(__dirname, 'public')));

// Cargar documentación de Swagger
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Definir el servicio SOAP
const service = {
    HelloService: {
        HelloServiceSoap: {
            sayHello: function(args) {
                return { greeting: "Hi, I am Erick. SOAP with Js" };
            }
        }
    }
};

// Definir el archivo WSDL
const wsdl = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" xmlns:tns="http://example.com/soap" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/" targetNamespace="http://example.com/soap">
    <message name="sayHelloRequest">
        <part name="name" type="xsd:string"/>
    </message>
    <message name="sayHelloResponse">
        <part name="greeting" type="xsd:string"/>
    </message>
    <portType name="HelloServicePortType">
        <operation name="sayHello">
            <input message="tns:sayHelloRequest"/>
            <output message="tns:sayHelloResponse"/>
        </operation>
    </portType>
    <binding name="HelloServiceSoap" type="tns:HelloServicePortType">
        <soap:binding transport="http://schemas.xmlsoap.org/soap/http"/>
        <operation name="sayHello">
            <soap:operation soapAction="urn:#sayHello"/>
            <input>
                <soap:body use="literal"/>
            </input>
            <output>
                <soap:body use="literal"/>
            </output>
        </operation>
    </binding>
    <service name="HelloService">
        <port name="HelloServiceSoap" binding="tns:HelloServiceSoap">
            <soap:address location="http://localhost:${port}/wsdl"/>
        </port>
    </service>
</definitions>`;

// Crear el servidor SOAP
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

// SOAP Endpoint
app.post('/wsdl', (req, res) => {
    res.set('Content-Type', 'text/xml');
    res.send(wsdl);
});

// Exponer el servicio SOAP
soap.listen(app, '/wsdl', service, wsdl);
