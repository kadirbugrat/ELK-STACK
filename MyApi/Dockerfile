# Base Image
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app
EXPOSE 80

# Build Image
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src
COPY ["MyApi/MyApi.csproj", "./"]
RUN dotnet restore "./MyApi.csproj"
COPY . .
WORKDIR "/src/MyApi"
RUN dotnet build "MyApi.csproj" -c Release -o /app/build

# Publish Image
FROM build AS publish
RUN dotnet publish "MyApi.csproj" -c Release -o /app/publish

# Final Stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "MyApi.dll"]
