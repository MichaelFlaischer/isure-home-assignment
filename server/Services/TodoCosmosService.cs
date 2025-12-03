using System.Net;
using Microsoft.Azure.Cosmos;
using server.Models;

namespace server.Services;

public class TodoCosmosService
{
    private const string DatabaseId = "todosdb";
    private const string ContainerId = "todos";

    private readonly Container _container;

    public TodoCosmosService(IConfiguration configuration)
    {
        var cosmosSection = configuration.GetSection("Cosmos");
        var endpoint = cosmosSection["Endpoint"];
        var key = cosmosSection["Key"];

        if (string.IsNullOrWhiteSpace(endpoint))
        {
            throw new InvalidOperationException("Cosmos endpoint configuration is missing.");
        }

        if (string.IsNullOrWhiteSpace(key))
        {
            throw new InvalidOperationException("Cosmos key configuration is missing.");
        }

        var client = new CosmosClient(endpoint, key);
        _container = client.GetContainer(DatabaseId, ContainerId);
    }

    public async Task<IEnumerable<TodoItem>> GetAllAsync()
    {
        var iterator = _container.GetItemQueryIterator<TodoItem>(
            new QueryDefinition("SELECT * FROM c"));

        var results = new List<TodoItem>();

        while (iterator.HasMoreResults)
        {
            var response = await iterator.ReadNextAsync().ConfigureAwait(false);
            results.AddRange(response.Resource);
        }

        return results;
    }

    public async Task<TodoItem?> GetByIdAsync(string id)
    {
        try
        {
            var response = await _container.ReadItemAsync<TodoItem>(id, new PartitionKey(id)).ConfigureAwait(false);
            return response.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    public async Task<TodoItem> CreateAsync(TodoItem item)
    {
        if (string.IsNullOrWhiteSpace(item.id))
        {
            item.id = Guid.NewGuid().ToString();
        }

        var response = await _container.CreateItemAsync(item, new PartitionKey(item.id)).ConfigureAwait(false);
        return response.Resource;
    }

    public async Task<TodoItem?> UpdateAsync(string id, TodoItem updated)
    {
        updated.id = id;

        try
        {
            var response = await _container.UpsertItemAsync(updated, new PartitionKey(id)).ConfigureAwait(false);
            return response.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    public async Task<bool> DeleteAsync(string id)
    {
        try
        {
            await _container.DeleteItemAsync<TodoItem>(id, new PartitionKey(id)).ConfigureAwait(false);
            return true;
        }
        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return false;
        }
    }
}
