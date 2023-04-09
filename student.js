const http = require('http');
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('mongodb');

const url = 'mongodb+srv://justinmathias75:justin75@cluster0.979of8m.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'justin';
const collectionName = 'students';

const server = http.createServer(async(req, res) => {
    if (req.url === '/') {
        // display the homepage with buttons for CRUD operations
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(`
      <html>
        <head>
          <title>Students</title>
          <style>
          button {
            display: inline-block;
            background-color: black;
            color: white;
            padding: 10px 20px;
            text-align: center;
            font-size: 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          
          button:hover {
            background-color: #555;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            font-size: 14px;
            font-family: Arial, sans-serif;
          }
          
          table th, table td {
            padding: 10px;
            text-align: left;
            vertical-align: middle;
            border: 1px solid #ccc;
          }
          
          table th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-transform: uppercase;
          }
          
          table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          table tr:hover {
            background-color: #ebebeb;
          }
          
          table caption {
            font-weight: bold;
            margin-bottom: 10px;
            text-align: left;
          }
          </style>
        </head>
        <body>
        <center><h1>THEORY ASSIGNMENT 2</h1></center>
        <center><h1>SAHARSH JUSTIN MATHIAS</h1></center>
        <center><h1>20MIC0064</h1></center>
        
        <center><button onclick="getStudents()">Get Students</button></center><br><br>
        <center><button onclick="addStudent()">Add Student</button></center><br><br>
        <center><button onclick="updateStudent()">Update Student</button></center><br><br>
        <center><button onclick="deleteStudent()">Delete Student</button></center><br><br>
          <table id="studentsTable" border="1">
            <thead>
              <tr>
                <th>Name</th>
                <th>Roll</th>
                <th>Email</th>
                <th>CGPA</th>
              </tr>
            </thead>
            <tbody>
            </tbody>
          </table>
          <script>
            function getStudents() {
              fetch('/students')
                .then(response => response.json())
                .then(data => {
                  const tableBody = document.querySelector('#studentsTable tbody');
                  tableBody.innerHTML = '';
                  data.forEach(student => {
                    const row = tableBody.insertRow();
                    row.insertCell().textContent = student.name;
                    row.insertCell().textContent = student.roll;
                    row.insertCell().textContent = student.email;
                    row.insertCell().textContent = student.cgpa;
                  });
                });
            }

            function addStudent() {
              const name = prompt('Enter name:');
              const roll = prompt('Enter roll:');
              const email = prompt('Enter email:');
              const cgpa = prompt('Enter CGPA:');
              fetch('/students', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({name, roll, email, cgpa})
              }).then(() => {
                getStudents();
              });
            }

            function updateStudent() {
              const id = prompt('Enter ID of student to update:');
              const name = prompt('Enter new name:');
              const roll = prompt('Enter new roll:');
              const email = prompt('Enter new email:');
              const cgpa = prompt('Enter new CGPA:');
              fetch('/students/' + id, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({name, roll, email, cgpa})
              }).then(() => {
                getStudents();
              });
            }

            function deleteStudent() {
              const id = prompt('Enter ID of student to delete:');
              fetch('/students/' + id, {
                method: 'DELETE'
              }).then(() => {
                getStudents();
              });
            }

            function findStudent() {
              const name = prompt('Enter name of student to find:');
              fetch('/students/search?name=' + name)
                .then(response => response.json())
                .then(data => {
                  const tableBody = document.querySelector('#studentsTable tbody');
                  tableBody.innerHTML = '';
                  data.forEach(student => {
                    const row = tableBody.insertRow();
                    row.insertCell().textContent = student.name;
                    row.insertCell().textContent = student.roll;
                    row.insertCell().textContent = student.email;
                    row.insertCell().textContent = student.cgpa;
                  });
                });
            }
          </script>
        </body>
      </html>
    `);
       res.end();
    } else if (req.url === '/students') {

        // handle GET request to fetch all students

        const client = new MongoClient(url);
        await client.connect();
        const collection = client.db(dbName).collection(collectionName);
        const students = await collection.find().toArray();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(students));
        res.end();
        await client.close();
    } else if (req.url.startsWith('/students/')) {
        const client = new MongoClient(url);
        await client.connect();
        const collection = client.db(dbName).collection(collectionName);
        const id = req.url.substring(10);
        if (req.method === 'PUT') {
            // handle PUT request to update a student

            const { name, roll, email, cgpa } = await getRequestBody(req);
            await collection.updateOne({ _id: new ObjectId(id) }, { $set: { name, roll, email, cgpa } });
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.write('Student updated successfully');
            res.end();
        } 
 else if (req.method === 'DELETE') {

            // handle DELETE request to delete a student

            await collection.deleteOne({ _id: ObjectId(id) });
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.write('Student deleted successfully');
            res.end();
        }
        await client.close();
    } else if (req.url.startsWith('/students/search')) {

        const client = new MongoClient(url);
        await client.connect();
        const collection = client.db(dbName).collection(collectionName);
        const name = req.url.substring(20);
        const students = await collection.find({ name }).toArray();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(students));
        res.end();
        await client.close();
    } else {
        // handle 404 error for any other requests
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.write('404 Not Found');
        res.end();
    }
});

async function getRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            resolve(JSON.parse(body));
        });
    });
}

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});


