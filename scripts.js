async function generateScenarios() {
    console.log('Generování scénářů spuštěno'); // Debugging
    const description = document.getElementById('description').value;

    if (!description) {
        alert('Prosím, zadejte popis situace.');
        return;
    }

    const apiKey = 'sk-proj-Re6aclt27gQswxBIrGkMT3BlbkFJkzri9a1MvMum4ZKNhGqs'; // Zde vložte váš skutečný API klíč
    console.log('API klíč použit:', apiKey); // Debugging
    const endpoint = 'https://api.openai.com/v1/chat/completions';

    const messages = [
        {
            role: 'system',
            content: 'Jsi kreativní a nápaditý asistent, který vytváří různé možné scénáře na základě dané situace.'
        },
        {
            role: 'user',
            content: `Představ si následující situaci: ${description}\nVymysli několik možných konců této situace.`
        }
    ];

    try {
        const response = await fetchWithRetry(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: messages,
                max_tokens: 150,
                n: 10,
                stop: null,
                temperature: 0.7
            })
        });

        console.log('Odpověď na požadavek:', response); // Debugging

        if (!response.ok) {
            const errorText = await response.text();
            console.error('HTTP Error:', response.status, errorText); // Debugging
            throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
        }

        const data = await response.json();
        console.log('Data obdržena:', data); // Debugging
        const scenarios = data.choices.map(choice => choice.message.content.trim());

        displayScenarios(scenarios);
    } catch (error) {
        console.error('Error:', error);
        alert(`Nastala chyba při generování scénářů. Zkuste to prosím znovu.\nChyba: ${error.message}`);
    }
}

async function fetchWithRetry(url, options, retries = 5, backoff = 3000) {
    for (let i = 0; i < retries; i++) {
        console.log(`Pokouším se o požadavek #${i + 1}`); // Debugging
        const response = await fetch(url, options);
        if (response.status !== 429) {
            return response;
        }
        console.warn('Rate limit exceeded. Retrying after backoff...');
        await new Promise(res => setTimeout(res, backoff));
        backoff *= 2; // Exponential backoff
    }
    throw new Error('Too many requests. Please try again later.');
}

function displayScenarios(scenarios) {
    const scenariosDiv = document.getElementById('scenarios');
    scenariosDiv.innerHTML = '';
    scenarios.forEach((scenario, index) => {
        const scenarioElement = document.createElement('div');
        scenarioElement.classList.add('scenario');
        scenarioElement.textContent = `Scénář ${index + 1}: ${scenario}`;
        scenariosDiv.appendChild(scenarioElement);
    });
}
