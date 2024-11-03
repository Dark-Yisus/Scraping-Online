// HTML Form
const searchForm = `
<form id="searchForm" class="mb-4">
    <input type="text" id="producto" class="form-control" placeholder="Ingrese producto a buscar" required>
    <button type="submit" class="btn btn-primary mt-2">Buscar</button>
</form>
<div id="results" class="mt-4"></div>
<div id="loading" style="display: none;">Cargando...</div>
`;

document.body.insertAdjacentHTML('beforeend', searchForm);

// Main JavaScript implementation
document.getElementById('searchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const producto = document.getElementById('producto').value;
    
    loading.style.display = 'block';
    results.innerHTML = '';

    try {
        // Search products
        const searchResponse = await fetch('https://mercado-scraping.shop/mercadolibre', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'your-auth-token' // If required
            },
            body: JSON.stringify({ producto })
        });

        const data = await searchResponse.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Display results
        displayResults(data);

        // Add download button if there are results
        if (data.datos && data.datos.length > 0) {
            const downloadButton = document.createElement('button');
            downloadButton.textContent = 'Descargar Excel';
            downloadButton.className = 'btn btn-success mt-3';
            downloadButton.onclick = () => downloadExcel(data);
            results.appendChild(downloadButton);
        }

    } catch (error) {
        results.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    } finally {
        loading.style.display = 'none';
    }
});

function displayResults(data) {
    const results = document.getElementById('results');
    
    if (!data.datos || data.datos.length === 0) {
        results.innerHTML = '<div class="alert alert-info">No se encontraron productos</div>';
        return;
    }

    const productsHTML = data.datos.map(product => `
        <div class="card mb-3">
            <div class="row g-0">
                <div class="col-md-4">
                    <img src="${product.imagenes}" class="img-fluid rounded-start" alt="${product.titulo}">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title">${product.titulo}</h5>
                        <p class="card-text">Vendedor: ${product.vendedor}</p>
                        <p class="card-text">Precio original: ${product.precio_original}</p>
                        <p class="card-text">Precio con descuento: ${product.precio_con_descuento}</p>
                        <p class="card-text">Descuento: ${product.descuento}</p>
                        <p class="card-text">Cuotas: ${product.cuotas}</p>
                        <p class="card-text">Envío: ${product.envios}</p>
                        <p class="card-text">Cantidad vendida: ${product.cantidad_vendida}</p>
                        <a href="${product.url_producto}" target="_blank" class="btn btn-primary">Ver en MercadoLibre</a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    results.innerHTML = `
        <h3>Resultados encontrados: ${data.num_products}</h3>
        <p>Tiempo de procesamiento: ${data.processing_time} segundos</p>
        ${productsHTML}
    `;
}

async function downloadExcel(data) {
    try {
        const formData = new FormData();
        formData.append('data', JSON.stringify(data));

        const response = await fetch('https://mercado-scraping.shop/descargarExcel', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Error al descargar el archivo');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'productos_mercadolibre.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

    } catch (error) {
        alert(`Error al descargar el Excel: ${error.message}`);
    }
}