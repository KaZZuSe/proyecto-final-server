// Instancio los módulos necesarios
const express = require("express");
const fs = require("fs");
const cors = require("cors");

// Creo una nueva aplicación Express
const app = express();

// Defino el puerto en el que escucha
const port = 3000;

// Configuro las opciones de CORS
const corsOptions = {
  origin: "http://localhost:4200", // Permito acceder a la aplicación desde localhost:4200(aplicación Angular)
  optionsSuccessStatus: 204, // Código de estado que se devuelve cuando la solicitud de pre-vuelo tiene éxito
  methods: "GET, POST, DELETE", // Métodos permitidos para las solicitudes CORS
};

// Uso el middleware de CORS con nuestras opciones
app.use(cors(corsOptions));

// Uso el middleware de express.json para analizar las solicitudes con cuerpos JSON
app.use(express.json());

// Definouna ruta GET para "/cines"
app.get("/cines", (req, res) => {
  // Obtengo los parámetros de consulta page y perPage, o establezco los valores predeterminados
  const page = parseInt(req.query.page) || 0;
  const perPage = parseInt(req.query.perPage) || 10;

  // Leo el archivo db.json
  fs.readFile("db.json", "utf8", (err, data) => {
    // Si hay un error, lo registro y envio un mensaje de error al cliente
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    // Analizo los datos JSON
    const jsonData = JSON.parse(data);

    // Calcula el inicio y el final de la página
    const start = page * perPage;
    const end = start + perPage;

    // Obtiene los cines para la página actual
    const result = jsonData.cines.slice(start, end);

    // Envia la respuesta al cliente
    res.status(200).json({
      cines: result,
      total: jsonData.cines.length,
      page,
      perPage,
      totalPages: Math.ceil(jsonData.cines.length / perPage),
    });
  });
});

// Define una ruta POST para "/cines"
app.post("/cines", (req, res) => {
  // Obtiene el nombre y la dirección del cuerpo de la solicitud
  const { nombre, direccion } = req.body;

  // Lee el archivo db.json
  fs.readFile("db.json", "utf8", (err, data) => {
    // Si hay un error, lo registra y envia un mensaje de error al cliente
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    // Analiza los datos JSON
    const jsonData = JSON.parse(data);

    // Obtiene el ID máximo actual
    const maxId = jsonData.cines.reduce(
      (max, cines) => Math.max(max, cines.id),
      0
    );

    // Creo un nuevo cine
    const newCine = {
      id: maxId + 1,
      nombre,
      direccion,
    };

    // Añado el nuevo cine a la lista de cines
    jsonData.cines.push(newCine);

    // Escribo los datos actualizados en db.json
    fs.writeFile("db.json", JSON.stringify(jsonData), (err) => {
      // Si hay un error, lo registro y envio un mensaje de error al cliente
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
        return;
      }

      // Envio la respuesta al cliente
      res.status(201).json(newCine);
    });
  });
});

// Defino una ruta DELETE para "/cines/:id"
app.delete("/cines/:id", (req, res) => {
  // Se obtiene el ID del parámetro de ruta
  const id = parseInt(req.params.id);

  // Leo el archivo db.json
  fs.readFile("db.json", "utf8", (err, data) => {
    // Si hay un error, se registra y envia un mensaje de error al cliente
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    // Analiza los datos JSON
    const jsonData = JSON.parse(data);

    // Busca el índice del cine con el ID dado
    const cineIndex = jsonData.cines.findIndex((cine) => cine.id === id);

    // Si no se encuentra el cine, enviamos un mensaje de error al cliente
    if (cineIndex === -1) {
      res.status(404).json({ message: "Cine no encontrado" });
      return;
    }

    // Elimina el cine de la lista de cines
    jsonData.cines.splice(cineIndex, 1);

    // Actualiza los ID de los cines restantes
    jsonData.cines = jsonData.cines.map((cine, index) => {
      return { ...cine, id: index + 1 };
    });

    // Escribe los datos actualizados en db.json
    fs.writeFile("db.json", JSON.stringify(jsonData), (err) => {
      // Si hay un error, se registra y envia un mensaje de error al cliente
      if (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
        return;
      }

      // Envia la respuesta al cliente
      res.status(200).json({ message: "Cine eliminado con éxito" });
    });
  });
});

// Se inicia la aplicación en el puerto especificado
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
