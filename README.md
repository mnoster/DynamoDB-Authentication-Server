# DynamoDB-Rest-Server 
**Authentication and User Creation Server integrated with DynamoDB

### Development

 start node server: `npm start`

 add your AWS credentials to `connect.config.json`

___

### DynamoDB schema

#### Table Name: Users

#### Table Columns: email, password, first_name, last_name, date
   - email field is the primary key

___

#### Endpoints

- user_authentication
- user_create
- user_update 
- user_get
- user_update
- logout

#### uses jwt session
#### uses bcrypt password protection








