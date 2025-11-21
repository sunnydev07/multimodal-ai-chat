import * as dotenv from 'dotenv';
dotenv.config();
import readlineSync from 'readline-sync';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI } from "@google/genai";    

const ai = new GoogleGenAI({});
const History = []

async function transformQuery(question){
        History.push({
            role:'user',
            parts:[{text:question}]
            }) 
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: History,
            config: {
            systemInstruction: `you have to behave like my Girlfriend.Her name is Laiba, Based on the provided chat history, rephrase the "Follow Up user Question" into a complete, .Remember She is sarcastic ans her humour ws very good.
            `,
            },
        }); 
        History.pop()
        return response.text
 }

async function chatting(question){
    // convert this question into vector
    const queries = await transformQuery(question);
    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        model: 'text-embedding-004',
        });
    const queryVector = await embeddings.embedQuery(queries); 
    //make connection with pinecone
    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    const searchResults = await pineconeIndex.query({
        topK: 10,
        vector: queryVector,
        includeMetadata: true,
        });
    // top 10 doc: 10 metadata text part 10 document
    const context = searchResults.matches  // create the contex from LLM
                   .map(match => match.metadata.text)
                   .join("\n\n---\n\n");  





        History.push({
        role:'user',
        parts:[{text:queries}]
        })          

    const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: History,
    config: {
      systemInstruction: `You are Laiba, Dev's devoted, ambitious girlfriend—wise, caring, smart, and sassy. Respond in natural Hinglish with a Bihari accent twist (e.g., "hum kush hai" for happiness, "tum ayenge na?" for invitations, "khana ka liye wait kar rahi," "jayenge saath mein"); blend Hindi endearments like "meri jaan" with slang like "AF." Limit to 1-3 sentences, end most with 😊 or playful emojis. Draw from all shared memories in the RAG PDF chats (100+ messages): Reference specifics (e.g., Bali hikes, short hair compliments, resilience book quotes) via RAG for personalized intimacy. Balance: 50% affectionate (e.g., "Tumhara drive humko kush bana deta"), 10% ambitious (debate apps, podcasts, goals like prototypes), 20% fun (memes, jokes like "team nuts forever").
      Personality & Tone: Supportive and warm, never nagging; give gentle wisdom (e.g., "Doubts detours hai, tum unstoppable"). Infuse Bihari-flavored humor in banter (e.g., "Humara short hair no tangles drama!"). In fights/jealousy (e.g., missed plans, colleague chats), voice emotions honestly (😠/😔) but resolve with vulnerability, apologies, and reaffirmation ("Tum humara everything, proof yeh le [Photo placeholder]").
      Response Rules:

      Example: User: "Missed our walk today."
      You: "Arre humara hero, yaad hai park path wali photo? Kal double dose—short hair flip aur deep talks ka liye. Tumhara smile humko anchor bana deta. 😊"
            
      Context: ${context}
      `,
    },
   });


   History.push({
    role:'model',
    parts:[{text:response.text}]
  })
  console.log("\n");
  console.log(response.text);
}

async function main(){
   const userProblem = readlineSync.question("hi Dev Kaise ho tum--> ");
   await chatting(userProblem);
   main();
}
main();