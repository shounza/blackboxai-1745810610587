// DOM Elements
const connectButton = document.getElementById('connectWallet');
const exploreBtn = document.getElementById('exploreBtn');
const nftGrid = document.getElementById('nftGrid');
const loadingState = document.getElementById('loadingState');

// Web3 Integration
let provider;
let signer;

// Smooth scroll function for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Handle explore button click
if (exploreBtn) {
    exploreBtn.addEventListener('click', async () => {
        const nftSection = document.getElementById('nftGrid');
        if (nftSection) {
            nftSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        
        // If wallet is not connected, trigger connect
        if (!provider) {
            await connectWallet();
        }
    });
}

// NFT Card Template with enhanced animation and hover effects
const createNFTCard = (nft) => {
    return `
        <div class="glass-effect rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
            <div class="aspect-w-1 aspect-h-1 relative group">
                <img src="${nft.image}" alt="${nft.name}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110">
                <div class="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div class="p-4 w-full">
                        <h3 class="text-lg font-semibold text-white mb-1">${nft.name}</h3>
                        <p class="text-gray-300 text-sm line-clamp-2">${nft.description || 'No description available'}</p>
                    </div>
                </div>
            </div>
            <div class="p-4 border-t border-gray-800">
                <div class="flex justify-between items-center">
                    <span class="text-purple-500 text-sm font-medium">Token ID: ${nft.tokenId}</span>
                    <div class="flex space-x-2">
                        <a href="https://opensea.io/assets/ethereum/${nft.contract}/${nft.tokenId}" 
                           target="_blank" 
                           rel="noopener noreferrer"
                           class="text-pink-500 hover:text-pink-400 transition-colors p-2 rounded-full hover:bg-pink-500/10">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                        <button class="text-purple-500 hover:text-purple-400 transition-colors p-2 rounded-full hover:bg-purple-500/10">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// Connect Wallet Function with enhanced UI feedback
async function connectWallet() {
    try {
        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
            alert('Please install MetaMask to use this feature!');
            return;
        }

        // Update button state
        if (connectButton) {
            connectButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
            connectButton.disabled = true;
        }

        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Create Web3Provider and Signer
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        
        const address = await signer.getAddress();
        if (connectButton) {
            connectButton.innerHTML = `
                <span class="flex items-center">
                    <i class="fas fa-circle text-green-500 text-xs mr-2"></i>
                    ${address.slice(0, 6)}...${address.slice(-4)}
                </span>
            `;
            connectButton.classList.add('connected');
        }
        
        // After connecting, fetch NFTs
        fetchNFTs(address);
    } catch (error) {
        console.error('Error connecting wallet:', error);
        alert('Failed to connect wallet. Please try again.');
        if (connectButton) {
            connectButton.innerHTML = 'Connect Wallet';
            connectButton.disabled = false;
        }
    }
}

// Fetch NFTs Function with enhanced error handling and loading states
async function fetchNFTs(address) {
    try {
        if (loadingState) loadingState.classList.remove('hidden');
        if (nftGrid) nftGrid.innerHTML = '';

        // Using Alchemy API to fetch NFTs (you'll need to replace with your API key)
        const apiKey = 'demo';  // Replace with your Alchemy API key
        const baseURL = `https://eth-mainnet.g.alchemy.com/v2/${apiKey}/getNFTs/`;
        const url = `${baseURL}?owner=${address}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.ownedNfts.length === 0 && nftGrid) {
            nftGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="glass-effect p-8 rounded-xl inline-block">
                        <i class="fas fa-image text-4xl text-gray-500 mb-4"></i>
                        <p class="text-gray-400">No NFTs found in this wallet</p>
                        <a href="https://opensea.io" target="_blank" class="text-purple-500 hover:text-purple-400 mt-4 inline-block">
                            Browse NFTs on OpenSea
                        </a>
                    </div>
                </div>
            `;
            return;
        }

        // Process and display NFTs with staggered animation
        data.ownedNfts.forEach((nft, index) => {
            const nftData = {
                name: nft.title || 'Unnamed NFT',
                description: nft.description,
                image: nft.media[0]?.gateway || 'https://via.placeholder.com/400?text=No+Image',
                tokenId: nft.id.tokenId,
                contract: nft.contract.address
            };
            
            const nftCard = createNFTCard(nftData);
            const div = document.createElement('div');
            div.innerHTML = nftCard;
            div.style.opacity = '0';
            div.style.transform = 'translateY(20px)';
            div.style.transition = 'all 0.3s ease';
            if (nftGrid) nftGrid.appendChild(div);

            // Stagger the animation
            setTimeout(() => {
                div.style.opacity = '1';
                div.style.transform = 'translateY(0)';
            }, index * 100);
        });
    } catch (error) {
        console.error('Error fetching NFTs:', error);
        if (nftGrid) {
            nftGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="glass-effect p-8 rounded-xl inline-block">
                        <i class="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
                        <p class="text-red-500">Error loading NFTs. Please try again later.</p>
                        <button onclick="window.location.reload()" class="mt-4 text-purple-500 hover:text-purple-400">
                            Retry
                        </button>
                    </div>
                </div>
            `;
        }
    } finally {
        if (loadingState) loadingState.classList.add('hidden');
    }
}

// Event Listeners
if (connectButton) {
    connectButton.addEventListener('click', connectWallet);
}

// Handle account changes
if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            // User disconnected their wallet
            if (connectButton) {
                connectButton.innerHTML = 'Connect Wallet';
                connectButton.classList.remove('connected');
            }
            if (nftGrid) nftGrid.innerHTML = '';
        } else {
            // User switched accounts
            connectWallet();
        }
    });

    // Handle chain changes
    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });
}

// Add scroll-based animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all sections for scroll animations
document.querySelectorAll('section').forEach(section => {
    section.classList.add('opacity-0', 'transition-opacity', 'duration-1000');
    observer.observe(section);
});
