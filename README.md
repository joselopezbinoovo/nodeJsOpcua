
# NodeJs  Opc Ua




## Instalación de dependencias

Para instalar las dependencias del proyecto ejecutaremos el siguiente comando

```bash
  npm i
```


## Conexión
Archivo de conexión bbdd .models/index, introducir nuestros credenciales de conexion

```bash 

const sequelize =new Sequelize('opc-ua', 'postgres', 'postgres', {
  host: 'localhost',
  dialect:'postgres'
});
```
## Creacion de bbdd en postgreSql

- Deberemos crear primero una base de datos en postgres.
- En nuestro caso la llamaremos opc-ua 





## Creacion tabla y migraciones 

-En uestro poyecto tenemos una carpeta llamada migrations la cual nos migrara a una tabla los campos que se encuentran dentro del archivo de migración. 
```bash
npx sequelize-cli db:migrate
```
- En caso de no tener dicho archivo mencionado anteirmente deberemos de ejecutar el siguiente comando para generar un archivo de migracion con la tabla y los campos

```bash
   npx sequelize-cli model:generate --name OpcUa --attributes variableString:string,variableName:string,conectionString:string 
--force
```


    
## Sql para insertar datos en postgreSql

```bash
INSERT INTO public."OpcUas"(
	"variableString", "variableName")
	VALUES ('ns=2;s=Simulation_Examples.Functions.Ramp1', 'Ramp1');


INSERT INTO public."OpcUas"(
	"variableString", "variableName")
	VALUES ('ns=2;s=Simulation_Examples.Functions.Ramp2', 'Ramp2');

INSERT INTO public."OpcUas"(
	"variableString", "variableName")
	VALUES ('ns=2;s=Simulation_Examples.Functions.Ramp3', 'Ramp3');


INSERT INTO public."OpcUas"(
	"variableString", "variableName")
	VALUES ('ns=2;s=Simulation_Examples.Functions.Ramp4', 'Ramp4');


INSERT INTO public."OpcUas"(
	"variableString", "variableName")
	VALUES ('ns=2;s=Simulation_Examples.Functions.Ramp5', 'Ramp5');
```










## API Documentación

#### Get all varaibles

```http
  GET /api/opcUa/getOpc
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `api_key` | `any` | **Devuelve todas las variables del plc**. |

Response: {
  "msg": "FUNCIONA",
  "data": [
    {
      "name": "Ramp1",
      "valuePLC": 63
    },
    {
      "name": "Ramp2",
      "valuePLC": 152.25
    },
    {
      "name": "Ramp3",
      "valuePLC": 239
    },
    {
      "name": "Ramp4",
      "valuePLC": 985
    },
    {
      "name": "Ramp5",
      "valuePLC": -620500
    },
    {
      "name": "Ramp6",
      "valuePLC": 1012500
    },
    {
      "name": "Ramp7",
      "valuePLC": 995506005
    },
    {
      "name": "Ramp8",
      "valuePLC": 198.25
    },
    {
      "name": "Random1",
      "valuePLC": 21
    },
    {
      "name": "Random2",
      "valuePLC": 168
    },
    {
      "name": "Random3",
      "valuePLC": -841
    },
    {
      "name": "Random4",
      "valuePLC": 855
    },
    {
      "name": "Random5",
      "valuePLC": -999976649
    },
    {
      "name": "Random6",
      "valuePLC": -976795
    },
    {
      "name": "Random7",
      "valuePLC": 22756
    },
    {
      "name": "Random8",
      "valuePLC": 8289
    },
    {
      "name": "Sine1",
      "valuePLC": -8.000712394714355
    },
    {
      "name": "Sine2",
      "valuePLC": 7.80361270904541
    },
    {
      "name": "Sine3",
      "valuePLC": 15.307337760925293
    },
    {
      "name": "Sine4",
      "valuePLC": 15.307337760925293
    },
    {
      "name": "User1",
      "valuePLC": "HELLO"
    },
    {
      "name": "User2",
      "valuePLC": 4.800000190734863
    },
    {
      "name": "User3",
      "valuePLC": true
    },
    {
      "name": "User4",
      "valuePLC": "TO DISPLAY A COMMA, PLACE"
    }
  ]
}

#### Get varaible

```http
  GET /api/opcUa/getOne/${id}
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `id` | `any` | **Devuelve todas las variables del plc**. |


Response: {
  "ok": true,
  "msg": "Dato recibido",
  "data": 35
}



