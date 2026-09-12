import os
import json
from google import genai

def test_genai():
    # Use the available API key, or prompt if it's missing (though it shouldn't be for this env)
    client = genai.Client() 
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents='Write a 1-sentence reason for high crop diversity score.'
    )
    print(response.text)

if __name__ == "__main__":
    test_genai()
