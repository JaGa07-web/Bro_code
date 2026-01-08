# Health Care System(Med tech)

A Flask-based Health Care System with Role-Based Access Control (Admin, Doctor, Worker).

## Docker Instructions

### Prerequisites
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop).

### How to Run

1.  Open a terminal in the project directory.
2.  Run the following command to build and start the application:
    ```bash
    docker-compose up --build -d
    ```
3.  The application will be accessible at:
    [http://localhost:4040](http://localhost:4040)

### How to Stop

To stop the application, run:
```bash
docker-compose down
```

### Troubleshooting
- If the port `4040` is busy, you can change it in the `docker-compose.yml` file under `ports`.
- To view logs: `docker-compose logs -f`
